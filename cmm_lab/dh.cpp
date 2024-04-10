#include "dh.h"

int dh_q_from_p(int dh_q_from_p_p)
{
	return (dh_q_from_p_p - 1) / 2;
}

int dh_generate_paremeters(
	struct DH dh_genparam_out[1],
	int dh_genparam_prime_len,
	int dh_genparam_generator)
{
	int dh_genparam_t1, dh_genparam_t2;
	int dh_genparam_p[1];

	if (dh_genparam_prime_len < 2 || dh_genparam_prime_len > 31)
	{
		return 0;
	}

	if (dh_genparam_generator <= 1)
	{
		return 0;
	}

	if (dh_genparam_generator == 2)
	{
		dh_genparam_t1 = 24;
		dh_genparam_t2 = 23;
		dh_genparam_out[0].params.g = 2;
	}
	else if (dh_genparam_generator == 5)
	{
		dh_genparam_t1 = 60;
		dh_genparam_t2 = 59;
		dh_genparam_out[0].params.g = 5;
	}
	else
	{
		dh_genparam_t1 = 12;
		dh_genparam_t2 = 11;
		dh_genparam_out[0].params.g = dh_genparam_generator;
	}

	if (!generate_prime(dh_genparam_p, dh_genparam_prime_len, 1, dh_genparam_t1, dh_genparam_t2))
	{
		return 0;
	}

	dh_genparam_out[0].params.p = dh_genparam_p[0];
	dh_genparam_out[0].params.q = dh_q_from_p(dh_genparam_p[0]);

	return 1;
}

int dh_generate_key(struct DH dh_genkey_out[1])
{
	int dh_genkey_privkey[1];
	if (!ffc_generate_privkey(dh_genkey_privkey, dh_genkey_out[0].params.q, -1))
	{
		return 0;
	}

	dh_genkey_out[0].privkey = dh_genkey_privkey[0];

	dh_genkey_out[0].pubkey = exp_mod(
		dh_genkey_out[0].params.g, dh_genkey_privkey[0], dh_genkey_out[0].params.p);

	return 1;
}

int dh_compute_key(
	int dh_compute_key_key_out[1],
	struct DH dh_compute_key_dh[1],
	int dh_compute_key_pubkey)
{
	int dh_compute_key_shared_key = exp_mod(
		dh_compute_key_pubkey,
		dh_compute_key_dh[0].privkey,
		dh_compute_key_dh[0].params.p);

	if (dh_compute_key_shared_key <= 1 ||
		dh_compute_key_shared_key == dh_compute_key_dh[0].params.p - 1)
	{
		return 0;
	}

	dh_compute_key_key_out[0] = dh_compute_key_shared_key;

	return 1;
}

int elgamal_pubkey_encryrpt(
	int elgamal_pubkenc_c_out[2],
	struct DH elgamal_pubkenc_dh[1],
	int elgamal_pubkenc_p)
{
	int elgamal_pubkenc_y[1];

	if (cmp_uint32(elgamal_pubkenc_p, elgamal_pubkenc_dh[0].params.p) >= 0)
	{
		return 0;
	}

	if (!ffc_generate_privkey(elgamal_pubkenc_y, elgamal_pubkenc_dh[0].params.q, -1))
	{
		return 0;
	}

	elgamal_pubkenc_c_out[0] = exp_mod(
		elgamal_pubkenc_dh[0].params.g,
		elgamal_pubkenc_y[0],
		elgamal_pubkenc_dh[0].params.p);

	elgamal_pubkenc_c_out[1] = mul_mod(
		exp_mod(
			elgamal_pubkenc_dh[0].pubkey,
			elgamal_pubkenc_y[0],
			elgamal_pubkenc_dh[0].params.p),
		elgamal_pubkenc_p,
		elgamal_pubkenc_dh[0].params.p);

	return 1;
}

int elgamal_privkey_decryrpt(
	int elgamal_privkdec_p_out[1],
	struct DH elgamal_privkdec_dh[1],
	int elgamal_privkdec_c[2])
{
	int elgamal_privkdec_inv[1];

	if (!inverse_mod(
			elgamal_privkdec_inv,
			exp_mod(
				elgamal_privkdec_c[0],
				elgamal_privkdec_dh[0].privkey,
				elgamal_privkdec_dh[0].params.p),
			elgamal_privkdec_dh[0].params.p))
	{
		return 0;
	}

	elgamal_privkdec_p_out[0] = mul_mod(
		elgamal_privkdec_c[1],
		elgamal_privkdec_inv[0],
		elgamal_privkdec_dh[0].params.p);

	return 1;
}

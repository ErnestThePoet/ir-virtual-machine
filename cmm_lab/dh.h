#ifndef DH_H_
#define DH_H_

#include<stdio.h>
#include "common.h"
#include "unsigned_op.h"
#include "crypto_core.h"

struct DH
{
	struct FFCParams params;

	int pubkey;
	int privkey;
};

int dh_q_from_p(int dh_q_from_p_p);

int dh_generate_paremeters(
	struct DH dh_genparam_out[1],
	int dh_genparam_prime_len,
	int dh_genparam_generator);

int dh_generate_key(struct DH dh_genkey_out[1]);

int dh_compute_key(
	int dh_compute_key_key_out[1],
	struct DH dh_compute_key_dh[1],
	int dh_compute_key_pubkey);

int elgamal_pubkey_encryrpt(
	int elgamal_pubkenc_c_out[2],
	struct DH elgamal_pubkenc_dh[1],
	int elgamal_pubkenc_p);

int elgamal_privkey_decryrpt(
	int elgamal_privkdec_p_out[1],
	struct DH elgamal_privkdec_dh[1],
	int elgamal_privkdec_c[2]);

#endif
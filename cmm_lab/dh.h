#ifndef DH_H_
#define DH_H_

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

#endif
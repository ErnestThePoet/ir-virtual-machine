#ifndef DH_H_
#define DH_H_

#include "common.h"
#include "unsigned_op.h"
#include "crypto_core.h"

struct DH
{
	int g;
	int p;
	int q;
};

int dh_generate_paremeters(
	int dh_genparam_p_out[1],
	int dh_genparam_prime_len,
	int dh_genparam_generator);

#endif
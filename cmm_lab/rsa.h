#ifndef RSA_H_
#define RSA_H_

#include "common.h"
#include "unsigned_op.h"
#include "crypto_core.h"

struct RSA
{
	int n;
	int e;
	int d;
	int p;
	int q;
};

int rsa_keygen(struct RSA rsa_keygen_rsa[1], int rsa_keygen_bits, int rsa_keygen_e);

#endif
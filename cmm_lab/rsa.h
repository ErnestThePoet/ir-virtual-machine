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

int rsa_pubkey_encryrpt(
	int rsa_pubkenc_c_out[1],
	struct RSA rsa_pubkenc_rsa[1],
	int rsa_pubkenc_p);

int rsa_privkey_encryrpt(
	int rsa_privkenc_c_out[1],
	struct RSA rsa_privkenc_rsa[1],
	int rsa_privkenc_p);

int rsa_privkey_decryrpt(
	int rsa_privkdec_p_out[1],
	struct RSA rsa_privkdec_rsa[1],
	int rsa_privkdec_c);

int rsa_pubkey_decryrpt(
	int rsa_pubkdec_p_out[1],
	struct RSA rsa_pubkdec_rsa[1],
	int rsa_pubkdec_c);

#endif
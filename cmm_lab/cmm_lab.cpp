#include <cstdio>
#include <iostream>
#include <string>
#include <chrono>
#include <bitset>
#include <random>

#include "cmm_wrappers.h"
#include "common.h"
#include "util.h"
#include "dh.h"
#include "rsa.h"

using namespace std;

int main()
{
	DH dh;

	init_two_powers();
	init_primes();

	srand32(time(nullptr));

	if (!dh_generate_paremeters(&dh, 31, 2))
	{
		cout << "paramgen error" << endl;
		return 1;
	}

	if (!dh_generate_key(&dh))
	{
		cout << "keygen error" << endl;
		return 1;
	}

	int c[2];
	int pt = dh.params.p - 4;
	int dec[1];

	printf("Plaintext=%d\n", pt);

	if (!elgamal_pubkey_encryrpt(c, &dh, pt))
	{
		cout << "enc error" << endl;
		return 1;
	}

	printf("Cipher=%d %d\n", c[0], c[1]);

	if (!elgamal_privkey_decryrpt(dec, &dh, c))
	{
		cout << "dec error" << endl;
		return 1;
	}

	printf("Decrypted=%d\n", dec[0]);

	return 0;
}
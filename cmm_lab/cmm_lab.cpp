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
	RSA rsa;

	init_two_powers();
	init_primes();

	srand32(time(nullptr));

	if (!rsa_keygen(&rsa, 31, 65537))
	{
		cout << "keygen error" << endl;
	}

	int c[1];
	int pt = 5211314;
	int dec[1];

	printf("Plaintext=%d\n", pt);

	if (!rsa_pubkey_encryrpt(c, &rsa, pt))
	{
		cout << "enc error" << endl;
	}

	printf("Cipher=%d\n", c[0]);

	if (!rsa_privkey_decryrpt(dec, &rsa, c[0]))
	{
		cout << "dec error" << endl;
	}

	printf("Decrtpted=%d\n", dec[0]);

	return 0;
}
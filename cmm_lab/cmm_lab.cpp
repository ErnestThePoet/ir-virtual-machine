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
		cout << "error" << endl;
	}

	printf("n=%d\ne=%d\nd=%d\np=%d\nq=%d\n",
		rsa.n,
		rsa.e,
		rsa.d,
		rsa.p,
		rsa.q
	);

	return 0;
}
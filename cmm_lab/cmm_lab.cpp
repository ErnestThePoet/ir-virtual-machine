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

using namespace std;

int main()
{
	srand32(time(nullptr));

	DH dh1;

	init_two_powers();
	init_primes();

	if (!dh_generate_paremeters(&dh1, 24, 2))
	{
		cout << "error 1" << endl;
	}

	printf("g=%d, p=%d, q=%d\n", dh1.params.g, dh1.params.p, dh1.params.q);

	DH dh2 = dh1;

	if (!dh_generate_key(&dh1))
	{
		cout << "error 2" << endl;
	}

	if (!dh_generate_key(&dh2))
	{
		cout << "error 2.2" << endl;
	}

	printf("pkA=%d, skA=%d, pkB=%d, skB=%d\n", dh1.pubkey, dh1.privkey, dh2.pubkey, dh2.privkey);

	int sk[2];
	if (!dh_compute_key(sk, &dh1, dh2.pubkey))
	{
		cout << "error 3" << endl;
	}

	if (!dh_compute_key(sk + 1, &dh2, dh1.pubkey))
	{
		cout << "error 3.2" << endl;
	}

	printf("%d\n%d\n", sk[0], sk[1]);

	return 0;
}
#include <cstdio>
#include <iostream>
#include <string>
#include <chrono>
#include <bitset>
#include <random>

#include "cmm_wrappers.h"
#include "common.h"
#include "util.h"
#include "unsigned_op.h"
#include "crypto.h"

using namespace std;

int main()
{
	int bits;
	cin >> bits;

	int out[1];

	srand32(time(nullptr));
	init_two_powers();
	init_primes();

	for (int i = 0; i < 32; i++)
	{
		if (!generate_prime(out, bits, 1, -1, -1))
		{
			cout << "error" << endl;
		}

		string s = "openssl prime ";
		s += to_string(out[0]);

		system(s.c_str());
	}

	return 0;
}
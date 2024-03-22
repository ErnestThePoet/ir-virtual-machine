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
	int g, p,l;
	cin >> g >> l;

	init_two_powers();
	init_primes();

	if (!dh_generate_paremeters(&p, l, g))
	{
		cout << "error" << endl;
	}

	printf("g=%d\np=%d\n", g, p);

	return 0;
}
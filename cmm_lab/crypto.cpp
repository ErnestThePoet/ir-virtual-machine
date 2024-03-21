#include "crypto.h"

static int kPrimes[64];

int init_primes()
{
	kPrimes[0] = 2;
	kPrimes[1] = 3;
	kPrimes[2] = 5;
	kPrimes[3] = 7;
	kPrimes[4] = 11;
	kPrimes[5] = 13;
	kPrimes[6] = 17;
	kPrimes[7] = 19;
	kPrimes[8] = 23;
	kPrimes[9] = 29;
	kPrimes[10] = 31;
	kPrimes[11] = 37;
	kPrimes[12] = 41;
	kPrimes[13] = 43;
	kPrimes[14] = 47;
	kPrimes[15] = 53;
	kPrimes[16] = 59;
	kPrimes[17] = 61;
	kPrimes[18] = 67;
	kPrimes[19] = 71;
	kPrimes[20] = 73;
	kPrimes[21] = 79;
	kPrimes[22] = 83;
	kPrimes[23] = 89;
	kPrimes[24] = 97;
	kPrimes[25] = 101;
	kPrimes[26] = 103;
	kPrimes[27] = 107;
	kPrimes[28] = 109;
	kPrimes[29] = 113;
	kPrimes[30] = 127;
	kPrimes[31] = 131;
	kPrimes[32] = 137;
	kPrimes[33] = 139;
	kPrimes[34] = 149;
	kPrimes[35] = 151;
	kPrimes[36] = 157;
	kPrimes[37] = 163;
	kPrimes[38] = 167;
	kPrimes[39] = 173;
	kPrimes[40] = 179;
	kPrimes[41] = 181;
	kPrimes[42] = 191;
	kPrimes[43] = 193;
	kPrimes[44] = 197;
	kPrimes[45] = 199;
	kPrimes[46] = 211;
	kPrimes[47] = 223;
	kPrimes[48] = 227;
	kPrimes[49] = 229;
	kPrimes[50] = 233;
	kPrimes[51] = 239;
	kPrimes[52] = 241;
	kPrimes[53] = 251;
	kPrimes[54] = 257;
	kPrimes[55] = 263;
	kPrimes[56] = 269;
	kPrimes[57] = 271;
	kPrimes[58] = 277;
	kPrimes[59] = 281;
	kPrimes[60] = 283;
	kPrimes[61] = 293;
	kPrimes[62] = 307;
	kPrimes[63] = 311;

	return 0;
}

int is_bit_set(int is_bit_set_x, int is_bit_set_n)
{
	if (is_bit_set_n < 0 || is_bit_set_n >= 32)
	{
		return 0;
	}

	return mod_uint32(
		rshift_uint32(
			is_bit_set_x, is_bit_set_n), 2) == 1;
}

int mul_mod(int mul_mod_a, int mul_mod_b, int mul_mod_p)
{
	int mul_mod_temp64[2], mul_mod_p64[2];

	mul_mod_p64[0] = 0;
	mul_mod_p64[1] = mul_mod_p;

	mul_uint32(mul_mod_temp64, mul_mod_a, mul_mod_b);
	mod_uint64(mul_mod_temp64, mul_mod_temp64, mul_mod_p64);

	return mul_mod_temp64[1];
}

int exp_mod(int exp_mod_a, int exp_mod_b, int exp_mod_p)
{
	int exp_mod_i;
	int exp_mod_prod64[2], exp_mod_a64[2], exp_mod_p64[2];

	exp_mod_prod64[0] = 0;
	exp_mod_prod64[1] = 1;

	exp_mod_a64[0] = 0;
	exp_mod_a64[1] = exp_mod_a;

	exp_mod_p64[0] = 0;
	exp_mod_p64[1] = exp_mod_p;

	while (exp_mod_b)
	{
		if (mod(exp_mod_b, 2))
		{
			mul_uint64(exp_mod_prod64, exp_mod_prod64, exp_mod_a64);
			mod_uint64(exp_mod_prod64, exp_mod_prod64, exp_mod_p64);
		}

		exp_mod_b = exp_mod_b / 2;

		mul_uint64(exp_mod_a64, exp_mod_a64, exp_mod_a64);
		mod_uint64(exp_mod_a64, exp_mod_a64, exp_mod_p64);
	}

	return exp_mod_prod64[1];
}

// Random number utilities

int rand_bits(int rand_bits_n, int rand_bits_top, int rand_bits_bottom)
{
	int rand_bits_result = rand32();

	if (rand_bits_n <= 0)
	{
		return 0;
	}

	if (rand_bits_n < 32)
	{
		rand_bits_result = rand_bits_result -
			kTwoPowers[rand_bits_n] *
			rshift_uint32(rand_bits_result, rand_bits_n);
	}

	if (rand_bits_top == 1 || rand_bits_top == 2)
	{
		if (!is_bit_set(rand_bits_result, rand_bits_n - 1))
		{
			rand_bits_result = rand_bits_result + kTwoPowers[rand_bits_n - 1];
		}

		if (rand_bits_top == 2 && rand_bits_n >= 2 &&
			!is_bit_set(rand_bits_result, rand_bits_n - 2))
		{
			rand_bits_result = rand_bits_result + kTwoPowers[rand_bits_n - 2];
		}
	}

	if (rand_bits_bottom == 1 && mod_uint32(rand_bits_result, 2) == 0)
	{
		rand_bits_result = rand_bits_result + 1;
	}

	return rand_bits_result;
}

// random number r:  0 <= r < range
int rand_range(int rand_range_out[1], int rand_range_range)
{
	int rand_range_n;
	int rand_range_count = 100;
	int rand_range_result;

	if (rand_range_range <= 0)
	{
		return 0;
	}

	rand_range_n = get_bits_uint32(rand_range_range);

	if (rand_range_n == 1)
	{
		rand_range_out[0] = 0;
	}
	else if (!is_bit_set(rand_range_range, rand_range_n - 2) &&
		!is_bit_set(rand_range_range, rand_range_n - 3))
	{
		while (1)
		{
			rand_range_result = rand_bits(rand_range_n + 1, 0, 0);
			if (cmp_uint32(rand_range_result, rand_range_range) >= 0)
			{
				rand_range_result = rand_range_result - rand_range_range;

				if (cmp_uint32(rand_range_result, rand_range_range) >= 0)
				{
					rand_range_result = rand_range_result - rand_range_range;
				}
			}

			if (cmp_uint32(rand_range_result, rand_range_range) < 0)
			{
				rand_range_out[0] = rand_range_result;
				return 1;
			}

			rand_range_count = rand_range_count - 1;
			if (rand_range_count <= 0)
			{
				return 0;
			}
		}
	}
	else
	{
		while (1)
		{
			rand_range_result = rand_bits(rand_range_n, 0, 0);
			if (cmp_uint32(rand_range_result, rand_range_range) < 0)
			{
				rand_range_out[0] = rand_range_result;
				return 1;
			}

			rand_range_count = rand_range_count - 1;
			if (rand_range_count <= 0)
			{
				return 0;
			}
		}
	}

	return 1;
}


// prime

// w must be >2 and odd
int miller_rabin_is_prime(int mr_out[1], int mr_w, int mr_iterations)
{
	int mr_i, mr_j, mr_a;
	int mr_w1, mr_w3, mr_x, mr_m, mr_z, mr_b;
	int mr_temp[1];
	int goto_outer_loop = 0;

	// w must be >2 and odd
	if (mr_w <= 2 || mod(mr_w, 2) == 0)
	{
		return 0;
	}

	// w1 := w - 1
	mr_w1 = mr_w - 1;
	// w3 := w - 3
	mr_w3 = mr_w - 3;

	//check w is larger than 3, otherwise the random b will be too small
	if (mr_w3 <= 0)
	{
		return 0;
	}

	// (Step 1) Calculate largest integer 'a' such that 2^a divides w-1
	// (Step 2) m = (w-1) / 2^a
	mr_a = 1;
	mr_m = mr_w1 / 2;
	while (mod(mr_m, 2) == 0)
	{
		mr_a = mr_a + 1;
		mr_m = mr_m / 2;
	}

	// (Step 4)
	mr_i = 0;
	while (mr_i < mr_iterations)
	{
		goto_outer_loop = 0;

		// (Step 4.1) obtain a Random string of bits b where 1 < b < w-1
		if (!rand_range(mr_temp, mr_w3))
		{
			return 0;
		}

		mr_b = mr_temp[0] + 2;

		// (Step 4.5) z = b^m mod w
		mr_z = exp_mod(mr_b, mr_m, mr_w);

		// (Step 4.6) if (z = 1 or z = w-1)
		if (mr_z == 1 || mr_z == mr_w1)
		{
			goto_outer_loop = 1;
		}

		if (!goto_outer_loop)
		{
			// (Step 4.7) for j = 1 to a-1
			mr_j = 1;
			while (!goto_outer_loop && mr_j < mr_a)
			{
				// (Step 4.7.1 - 4.7.2) x = z. z = x^2 mod w
				mr_x = mr_z;
				mr_z = mul_mod(mr_x, mr_x, mr_w);

				// (Step 4.7.3)
				if (mr_z == mr_w1)
				{
					goto_outer_loop = 1;
				}

				if (!goto_outer_loop)
				{
					// (Step 4.7.4)
					if (mr_z == 1)
					{
						mr_out[0] = 0;
						return 1;
					}

					mr_j = mr_j + 1;
				}
			}

			if (!goto_outer_loop)
			{
				// At this point z = b^((w-1)/2) mod w
				// (Steps 4.8 - 4.9) x = z, z = x^2 mod w
				mr_x = mr_z;
				mr_z = mul_mod(mr_x, mr_x, mr_w);

				// (Step 4.10)
				if (mr_z == 1)
				{
					mr_out[0] = 0;
					return 1;
				}

				// (Step 4.11) x = b^(w-1) mod w
				mr_x = mr_z;

				mr_out[0] = 0;
				return 1;
			}
		}

		// outer_loop:
		mr_i = mr_i + 1;
	}

	// (Step 5)
	mr_out[0] = 1;

	return 1;
}

int is_prime(int is_prime_out[1], int is_prime_checks, int is_prime_w, int is_prime_do_trial_division)
{
	int is_prime_i;

	// w must be bigger than 1
	if (is_prime_w <= 1)
	{
		return 0;
	}

	// w must be odd
	if (mod(is_prime_w, 2) == 0)
	{
		// 2 is the only even prime
		is_prime_out[0] = (is_prime_w == 2);
		return 1;
	}
	else
	{
		// Take care of the really small prime 3
		if (is_prime_w == 3)
		{
			is_prime_out[0] = 1;
			return 1;
		}
	}

	// first look for small factors
	if (is_prime_do_trial_division)
	{
		is_prime_i = 1;
		while (is_prime_i < 64)
		{
			if (mod(is_prime_w, kPrimes[is_prime_i]) == 0)
			{
				is_prime_out[0] = (is_prime_w == kPrimes[is_prime_i]);
				return 1;
			}

			is_prime_i = is_prime_i + 1;
		}
	}

	if (!miller_rabin_is_prime(is_prime_out, is_prime_w, is_prime_checks))
	{
		return 0;
	}

	return 1;
}

// bits must be >0 and <=31
int probable_prime(int out[1], int bits, int safe, int mods[64])
{
	int i;

	int goto_again = 1;
	int goto_loop = 1;
	int loop_td = 1;

	int rnd;
	int delta[2];
	int mod_64[2];
	int prime_64[2];
	int prime_square[2];
	int rnd_64[2];
	int temp1[2];

	int trial_divisions = 64;

	int max_delta[2];
	int mask2[2];
	int const_7fffffff[2];
	int const_2[2];
	int const_4[2];

	// also use as subtrahend
	max_delta[0] = 0;
	max_delta[1] = kPrimes[63];

	mask2[0] = -1;
	mask2[1] = -1;

	const_7fffffff[0] = 0;
	const_7fffffff[1] = kTwoPowers[31] - 1;

	const_2[0] = 0;
	const_2[1] = 2;

	const_4[0] = 0;
	const_4[1] = 4;

	sub_uint64(max_delta, mask2, max_delta);

	// again:
	while (goto_again)
	{
		goto_again = 0;

		rnd = rand_bits(bits, 2, 1);

		if (safe && mod(rnd / 2, 2) == 0)
		{
			rnd = rnd + 2;
		}

		rnd_64[0] = 0;
		rnd_64[1] = rnd;

		i = 1;
		while (i < trial_divisions)
		{
			mods[i] = mod(rnd, kPrimes[i]);

			i = i + 1;
		}

		delta[0] = 0;
		delta[1] = 0;

		// loop:
		while (!goto_again && goto_loop)
		{
			goto_loop = 0;

			i = 1;
			while (!goto_loop && !goto_again && loop_td && i < trial_divisions)
			{
				loop_td = 1;
				/*
				 * check that rnd is a prime and also that
				 * gcd(rnd-1,primes) == 1 (except for 2)
				 * do the second check only if we are interested in safe primes
				 * in the case that the candidate prime is a single word then
				 * we check only the primes up to sqrt(rnd)
				 */

				mul_uint32(prime_square, kPrimes[i], kPrimes[i]);
				add_uint64(temp1, rnd_64, delta);
				if (bits <= 31 && cmp_uint64(delta, const_7fffffff) <= 0 &&
					cmp_uint64(prime_square, temp1) > 0)
				{
					// break;
					loop_td = 0;
				}

				if (loop_td)
				{
					mod_64[0] = 0;
					mod_64[1] = mods[i];

					prime_64[0] = 0;
					prime_64[1] = kPrimes[i];

					add_uint64(temp1, mod_64, delta);

					mod_uint64(temp1, temp1, prime_64);

					// kPrimes are all 32bit positive, so 
					// is the remainder
					if ((safe && temp1[1] <= 1) || (!safe && temp1[1] == 0))
					{
						if (safe)
						{
							add_uint64(delta, delta, const_4);
						}
						else
						{
							add_uint64(delta, delta, const_2);
						}

						if (cmp_uint64(delta, max_delta) > 0)
						{
							// goto again;
							goto_again = 1;
						}

						if (!goto_again)
						{
							// goto loop;
							goto_loop = 1;
						}
					}

					if (!goto_again && !goto_loop)
					{
						i = i + 1;
					}
				}
			}

			if (!goto_again && !goto_loop)
			{
				rnd = rnd + delta[1];
				if (get_bits_uint32(rnd) != bits)
				{
					goto_again = 1;
				}
			}
		}
	}

	out[0] = rnd;

	return 1;
}

// bits must be >0 and <=31; add must be >0; rem must be either >0 or -1
int probable_prime_dh(int out[1], int bits, int safe, int mods[64], int add, int rem)
{
	int i;

	int goto_again = 1;
	int goto_loop = 1;
	int loop_td = 1;

	int rnd;
	int delta[2];
	int add_64[2];
	int mod_64[2];
	int prime_64[2];
	int prime_square[2];
	int rnd_64[2];
	int temp1[2];

	int trial_divisions = 64;

	int max_delta[2];
	int mask2[2];
	int const_7fffffff[2];
	int const_2[2];
	int const_4[2];

	add_64[0] = 0;
	add_64[1] = add;

	// also use as subtrahend
	max_delta[0] = 0;
	max_delta[1] = kPrimes[63];

	mask2[0] = -1;
	mask2[1] = -1;

	const_7fffffff[0] = 0;
	const_7fffffff[1] = kTwoPowers[31] - 1;

	const_2[0] = 0;
	const_2[1] = 2;

	const_4[0] = 0;
	const_4[1] = 4;

	sub_uint64(max_delta, mask2, max_delta);

	sub_uint64(add_64, mask2, add_64);

	if (cmp_uint64(max_delta, add_64) > 0)
	{
		max_delta[0] = add_64[0];
		max_delta[1] = add_64[1];
	}

	// again:
	while (goto_again)
	{
		goto_again = 0;

		rnd = rand_bits(bits, 1, 1);

		rnd = rnd - mod(rnd, add);

		if (rem == -1)
		{
			if (safe)
			{
				rnd = rnd + 3;
			}
			else
			{
				rnd = rnd + 1;
			}
		}
		else
		{
			rnd = rnd + rem;
		}

		if (get_bits_uint32(rnd) < bits || ((safe && rnd < 5) || (!safe && rnd < 3)))
		{
			rnd = rnd + add;
		}

		// we now have a random number 'rnd' to test.

		rnd_64[0] = 0;
		rnd_64[1] = rnd;

		i = 1;
		while (i < trial_divisions)
		{
			mods[i] = mod(rnd, kPrimes[i]);

			i = i + 1;
		}

		delta[0] = 0;
		delta[1] = 0;

		// loop:
		while (!goto_again && goto_loop)
		{
			goto_loop = 0;

			i = 1;
			while (!goto_loop && !goto_again && loop_td && i < trial_divisions)
			{
				loop_td = 1;
				/*
				 * check that rnd is a prime and also that
				 * gcd(rnd-1,primes) == 1 (except for 2)
				 * do the second check only if we are interested in safe primes
				 * in the case that the candidate prime is a single word then
				 * we check only the primes up to sqrt(rnd)
				 */

				mul_uint32(prime_square, kPrimes[i], kPrimes[i]);
				add_uint64(temp1, rnd_64, delta);
				if (bits <= 31 && cmp_uint64(delta, const_7fffffff) <= 0 &&
					cmp_uint64(prime_square, temp1) > 0)
				{
					// break;
					loop_td = 0;
				}

				if (loop_td)
				{
					mod_64[0] = 0;
					mod_64[1] = mods[i];

					prime_64[0] = 0;
					prime_64[1] = kPrimes[i];

					add_uint64(temp1, mod_64, delta);

					mod_uint64(temp1, temp1, prime_64);

					// kPrimes are all 32bit positive, so 
					// is the remainder
					if ((safe && temp1[1] <= 1) || (!safe && temp1[1] == 0))
					{
						add_uint64(delta, delta, add_64);

						if (cmp_uint64(delta, max_delta) > 0)
						{
							// goto again;
							goto_again = 1;
						}

						if (!goto_again)
						{
							// goto loop;
							goto_loop = 1;
						}
					}

					if (!goto_again && !goto_loop)
					{
						i = i + 1;
					}
				}
			}

			if (!goto_again && !goto_loop)
			{
				rnd = rnd + delta[1];
			}
		}
	}

	out[0] = rnd;

	return 1;
}

// bits must be >0 and <=31; add and rem must be either positive or -1
int generate_prime(int out[1], int bits, int safe, int add, int rem)
{
	int found = 0;
	int t;
	int i;
	int is_prime_out[1];
	int mods[64];
	int checks = 64;
	int goto_loop = 1;

	if (bits < 2 || bits>31)
	{
		return 0;
	}
	else if (add == -1 && safe && bits < 6 && bits != 3)
	{
		/*
		 * The smallest safe prime (7) is three bits.
		 * But the following two safe primes with less than 6 bits (11, 23)
		 * are unreachable for BN_rand with BN_RAND_TOP_TWO.
		 */
		return 0;
	}

	// loop:
	while (goto_loop)
	{
		goto_loop = 0;

		if (add == -1)
		{
			if (!probable_prime(out, bits, safe, mods))
			{
				return 0;
			}
		}
		else
		{
			if (!probable_prime_dh(out, bits, safe, mods, add, rem))
			{
				return 0;
			}
		}

		if (!safe)
		{
			if (!is_prime(is_prime_out, checks, out[0], 0))
			{
				return 0;
			}

			if (is_prime_out[0] == 0)
			{
				goto_loop = 1;
			}
		}
		else
		{
			t = out[0] / 2;

			i = 0;
			while (!goto_loop && i < checks)
			{
				if (!is_prime(is_prime_out, 1, out[0], 0))
				{
					return 0;
				}

				if (is_prime_out[0] == 0)
				{
					goto_loop = 1;
				}

				if (!goto_loop)
				{
					if (!is_prime(is_prime_out, 1, t, 0))
					{
						return 0;
					}

					if (is_prime_out[0] == 0)
					{
						goto_loop = 1;
					}

					if (!goto_loop)
					{
						i = i + 1;
					}
				}
			}
		}

		if (!goto_loop)
		{
			found = 1;
		}
	}

	return found;
}
#include "crypto_core.h"

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
			is_bit_set_x, is_bit_set_n), 2);
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

int ucmp(int ucmp_a, int ucmp_b)
{
	if (ucmp_a < 0)
	{
		ucmp_a = -ucmp_a;
	}

	if (ucmp_b < 0)
	{
		ucmp_b = -ucmp_b;
	}

	if (ucmp_a > ucmp_b)
	{
		return 1;
	}
	else if (ucmp_a < ucmp_b)
	{
		return -1;
	}
	else
	{
		return 0;
	}
}

int nnmod(int nnmod_a, int nnmod_b)
{
	int nnmod_m = mod(nnmod_a, nnmod_b);
	if (nnmod_m < 0)
	{
		if (nnmod_b < 0)
		{
			nnmod_m = nnmod_m - nnmod_b;
		}
		else
		{
			nnmod_m = nnmod_m + nnmod_b;
		}
	}

	return nnmod_m;
}

// GCD-Related

// Return 0 if no inv
int inverse_mod(int invmod_inv[1], int invmod_a, int invmod_n)
{
	int invmod_A,
		invmod_B,
		invmod_X,
		invmod_Y,
		invmod_M,
		invmod_D,
		invmod_T,
		invmod_R,
		invmod_shift,
		invmod_abits,
		invmod_bbits,
		invmod_tmp;

	int invmod_sign;

	if (invmod_n == 1 || invmod_n == 0)
	{
		return 0;
	}

	invmod_X = 1;
	invmod_Y = 0;
	invmod_B = invmod_a;
	invmod_A = invmod_n;

	if (invmod_A < 0)
	{
		invmod_A = -invmod_A;
	}

	if (invmod_B < 0 || ucmp(invmod_B, invmod_A) >= 0)
	{
		invmod_B = nnmod(invmod_B, invmod_A);
	}

	invmod_sign = -1;

	if (mod(invmod_n, 2))
	{
		while (invmod_B)
		{
			invmod_shift = 0;

			while (!is_bit_set(invmod_B, invmod_shift))
			{
				invmod_shift = invmod_shift + 1;
				if (mod(invmod_X, 2))
				{
					invmod_X = invmod_X + invmod_n;
				}

				invmod_X = rshift_uint32(invmod_X, 1);
			}

			if (invmod_shift > 0)
			{
				invmod_B = rshift_uint32(invmod_B, invmod_shift);
			}

			invmod_shift = 0;
			while (!is_bit_set(invmod_A, invmod_shift))
			{
				invmod_shift = invmod_shift + 1;
				if (mod(invmod_Y, 2))
				{
					invmod_Y = invmod_Y + invmod_n;
				}

				invmod_Y = rshift_uint32(invmod_Y, 1);
			}

			if (invmod_shift > 0)
			{
				invmod_A = rshift_uint32(invmod_A, invmod_shift);
			}

			if (cmp_uint32(invmod_B, invmod_A) >= 0)
			{
				invmod_X = invmod_X + invmod_Y;
				invmod_B = invmod_B - invmod_A;
			}
			else
			{
				invmod_Y = invmod_Y + invmod_X;
				invmod_A = invmod_A - invmod_B;
			}
		}
	}
	else
	{
		while (invmod_B)
		{
			invmod_abits = get_bits_uint32(invmod_A);
			invmod_bbits = get_bits_uint32(invmod_B);

			if (invmod_abits == invmod_bbits)
			{
				invmod_D = 1;
				invmod_M = invmod_A - invmod_B;
			}
			else if (invmod_abits == invmod_bbits + 1)
			{
				invmod_T = invmod_B * 2;
				if (ucmp(invmod_A, invmod_T) < 0)
				{
					invmod_D = 1;
					invmod_M = invmod_A - invmod_B;
				}
				else
				{
					invmod_M = invmod_A - invmod_T;
					invmod_D = invmod_T + invmod_B;
					if (ucmp(invmod_A, invmod_D) < 0)
					{
						invmod_D = 2;
					}
					else
					{
						invmod_D = 3;
						invmod_M = invmod_M - invmod_B;
					}
				}
			}
			else
			{
				invmod_D = invmod_A / invmod_B;
				invmod_M = mod(invmod_A, invmod_B);
			}

			invmod_tmp = invmod_A;
			invmod_A = invmod_B;
			invmod_B = invmod_M;

			if (invmod_D == 1)
			{
				invmod_tmp = invmod_X + invmod_Y;
			}
			else
			{
				if (invmod_D == 2)
				{
					invmod_tmp = invmod_X * 2;
				}
				else if (invmod_D == 4)
				{
					invmod_tmp = invmod_X * 4;
				}
				else
				{
					invmod_tmp = invmod_D * invmod_X;
				}

				invmod_tmp = invmod_tmp + invmod_Y;
			}

			invmod_M = invmod_Y;
			invmod_Y = invmod_X;
			invmod_X = invmod_tmp;
			invmod_sign = -invmod_sign;
		}
	}


	if (invmod_sign < 0)
	{
		invmod_Y = invmod_n - invmod_Y;
	}

	if (invmod_A == 1)
	{
		if (invmod_Y >= 0 && ucmp(invmod_Y, invmod_n) < 0)
		{
			invmod_R = invmod_Y;
		}
		else
		{
			invmod_R = nnmod(invmod_Y, invmod_n);
		}
	}
	else
	{
		return 0;
	}

	invmod_inv[0] = invmod_R;

	return 1;
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

int is_prime(
	int is_prime_out[1],
	int is_prime_checks,
	int is_prime_w,
	int is_prime_do_trial_division)
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
int probable_prime(int pp_out[1], int pp_bits, int pp_safe, int pp_mods[64])
{
	int pp_i;

	int pp_goto_again = 1;
	int pp_goto_loop = 1;
	int pp_loop_td = 1;

	int pp_rnd;
	int pp_delta[2];
	int pp_mod_64[2];
	int pp_prime_64[2];
	int pp_prime_square[2];
	int pp_rnd_64[2];
	int pp_temp1[2];

	int pp_trial_divisions = 64;

	int pp_max_delta[2];
	int pp_mask2[2];
	int pp_const_7fffffff[2];
	int pp_const_2[2];
	int pp_const_4[2];

	// also use as subtrahend
	pp_max_delta[0] = 0;
	pp_max_delta[1] = kPrimes[63];

	pp_mask2[0] = -1;
	pp_mask2[1] = -1;

	pp_const_7fffffff[0] = 0;
	pp_const_7fffffff[1] = kTwoPowers[31] - 1;

	pp_const_2[0] = 0;
	pp_const_2[1] = 2;

	pp_const_4[0] = 0;
	pp_const_4[1] = 4;

	sub_uint64(pp_max_delta, pp_mask2, pp_max_delta);

	// again:
	pp_goto_again = 1;
	while (pp_goto_again)
	{
		pp_goto_again = 0;

		pp_rnd = rand_bits(pp_bits, 2, 1);

		if (pp_safe && mod(pp_rnd / 2, 2) == 0)
		{
			pp_rnd = pp_rnd + 2;
		}

		pp_rnd_64[0] = 0;
		pp_rnd_64[1] = pp_rnd;

		pp_i = 1;
		while (pp_i < pp_trial_divisions)
		{
			pp_mods[pp_i] = mod(pp_rnd, kPrimes[pp_i]);

			pp_i = pp_i + 1;
		}

		pp_delta[0] = 0;
		pp_delta[1] = 0;

		// loop:
		pp_goto_loop = 1;
		while (!pp_goto_again && pp_goto_loop)
		{
			pp_goto_loop = 0;

			pp_i = 1;

			pp_loop_td = 1;
			while (!pp_goto_loop && !pp_goto_again && pp_loop_td && pp_i < pp_trial_divisions)
			{
				/*
				 * check that rnd is a prime and also that
				 * gcd(rnd-1,primes) == 1 (except for 2)
				 * do the second check only if we are interested in safe primes
				 * in the case that the candidate prime is a single word then
				 * we check only the primes up to sqrt(rnd)
				 */

				mul_uint32(pp_prime_square, kPrimes[pp_i], kPrimes[pp_i]);
				add_uint64(pp_temp1, pp_rnd_64, pp_delta);
				if (pp_bits <= 31 && cmp_uint64(pp_delta, pp_const_7fffffff) <= 0 &&
					cmp_uint64(pp_prime_square, pp_temp1) > 0)
				{
					// break;
					pp_loop_td = 0;
				}

				if (pp_loop_td)
				{
					pp_mod_64[0] = 0;
					pp_mod_64[1] = pp_mods[pp_i];

					pp_prime_64[0] = 0;
					pp_prime_64[1] = kPrimes[pp_i];

					add_uint64(pp_temp1, pp_mod_64, pp_delta);

					mod_uint64(pp_temp1, pp_temp1, pp_prime_64);

					// kPrimes are all 32bit positive, so 
					// is the remainder
					if ((pp_safe && pp_temp1[1] <= 1) || (!pp_safe && pp_temp1[1] == 0))
					{
						if (pp_safe)
						{
							add_uint64(pp_delta, pp_delta, pp_const_4);
						}
						else
						{
							add_uint64(pp_delta, pp_delta, pp_const_2);
						}

						if (cmp_uint64(pp_delta, pp_max_delta) > 0)
						{
							// goto again;
							pp_goto_again = 1;
						}

						if (!pp_goto_again)
						{
							// goto loop;
							pp_goto_loop = 1;
						}
					}

					if (!pp_goto_again && !pp_goto_loop)
					{
						pp_i = pp_i + 1;
					}
				}
			}

			if (!pp_goto_again && !pp_goto_loop)
			{
				pp_rnd = pp_rnd + pp_delta[1];
				if (get_bits_uint32(pp_rnd) != pp_bits)
				{
					pp_goto_again = 1;
				}
			}
		}
	}

	pp_out[0] = pp_rnd;

	return 1;
}

// bits must be >0 and <=31; add must be >0; rem must be either >0 or -1
int probable_prime_dh(
	int ppdh_out[1],
	int ppdh_bits,
	int ppdh_safe,
	int ppdh_mods[64],
	int ppdh_add,
	int ppdh_rem)
{
	int ppdh_i;

	int ppdh_goto_again = 1;
	int ppdh_goto_loop = 1;
	int ppdh_loop_td = 1;

	int ppdh_rnd;
	int ppdh_delta[2];
	int ppdh_add_64[2];
	int ppdh_mod_64[2];
	int ppdh_prime_64[2];
	int ppdh_prime_square[2];
	int ppdh_rnd_64[2];
	int ppdh_temp1[2];

	int ppdh_trial_divisions = 64;

	int ppdh_max_delta[2];
	int ppdh_mask2[2];
	int ppdh_const_7fffffff[2];
	int ppdh_const_2[2];
	int ppdh_const_4[2];

	ppdh_add_64[0] = 0;
	ppdh_add_64[1] = ppdh_add;

	// also use as subtrahend
	ppdh_max_delta[0] = 0;
	ppdh_max_delta[1] = kPrimes[63];

	ppdh_mask2[0] = -1;
	ppdh_mask2[1] = -1;

	ppdh_const_7fffffff[0] = 0;
	ppdh_const_7fffffff[1] = kTwoPowers[31] - 1;

	ppdh_const_2[0] = 0;
	ppdh_const_2[1] = 2;

	ppdh_const_4[0] = 0;
	ppdh_const_4[1] = 4;

	sub_uint64(ppdh_max_delta, ppdh_mask2, ppdh_max_delta);

	sub_uint64(ppdh_add_64, ppdh_mask2, ppdh_add_64);

	if (cmp_uint64(ppdh_max_delta, ppdh_add_64) > 0)
	{
		ppdh_max_delta[0] = ppdh_add_64[0];
		ppdh_max_delta[1] = ppdh_add_64[1];
	}

	// again:
	ppdh_goto_again = 1;
	while (ppdh_goto_again)
	{
		ppdh_goto_again = 0;

		ppdh_rnd = rand_bits(ppdh_bits, 1, 1);

		ppdh_rnd = ppdh_rnd - mod(ppdh_rnd, ppdh_add);

		if (ppdh_rem == -1)
		{
			if (ppdh_safe)
			{
				ppdh_rnd = ppdh_rnd + 3;
			}
			else
			{
				ppdh_rnd = ppdh_rnd + 1;
			}
		}
		else
		{
			ppdh_rnd = ppdh_rnd + ppdh_rem;
		}

		if (get_bits_uint32(ppdh_rnd) < ppdh_bits ||
			((ppdh_safe && ppdh_rnd < 5) ||
				(!ppdh_safe && ppdh_rnd < 3)))
		{
			ppdh_rnd = ppdh_rnd + ppdh_add;
		}

		// we now have a random number 'rnd' to test.

		ppdh_rnd_64[0] = 0;
		ppdh_rnd_64[1] = ppdh_rnd;

		ppdh_i = 1;
		while (ppdh_i < ppdh_trial_divisions)
		{
			ppdh_mods[ppdh_i] = mod(ppdh_rnd, kPrimes[ppdh_i]);

			ppdh_i = ppdh_i + 1;
		}

		ppdh_delta[0] = 0;
		ppdh_delta[1] = 0;

		// loop:
		ppdh_goto_loop = 1;
		while (!ppdh_goto_again && ppdh_goto_loop)
		{
			ppdh_goto_loop = 0;

			ppdh_i = 1;
			ppdh_loop_td = 1;
			while (!ppdh_goto_loop && !ppdh_goto_again && ppdh_loop_td && ppdh_i < ppdh_trial_divisions)
			{
				/*
				 * check that rnd is a prime and also that
				 * gcd(rnd-1,primes) == 1 (except for 2)
				 * do the second check only if we are interested in safe primes
				 * in the case that the candidate prime is a single word then
				 * we check only the primes up to sqrt(rnd)
				 */

				mul_uint32(ppdh_prime_square, kPrimes[ppdh_i], kPrimes[ppdh_i]);
				add_uint64(ppdh_temp1, ppdh_rnd_64, ppdh_delta);
				if (ppdh_bits <= 31 && cmp_uint64(ppdh_delta, ppdh_const_7fffffff) <= 0 &&
					cmp_uint64(ppdh_prime_square, ppdh_temp1) > 0)
				{
					// break;
					ppdh_loop_td = 0;
				}

				if (ppdh_loop_td)
				{
					ppdh_mod_64[0] = 0;
					ppdh_mod_64[1] = ppdh_mods[ppdh_i];

					ppdh_prime_64[0] = 0;
					ppdh_prime_64[1] = kPrimes[ppdh_i];

					add_uint64(ppdh_temp1, ppdh_mod_64, ppdh_delta);

					mod_uint64(ppdh_temp1, ppdh_temp1, ppdh_prime_64);

					// kPrimes are all 32bit positive, so 
					// is the remainder
					if ((ppdh_safe && ppdh_temp1[1] <= 1) || (!ppdh_safe && ppdh_temp1[1] == 0))
					{
						add_uint64(ppdh_delta, ppdh_delta, ppdh_add_64);

						if (cmp_uint64(ppdh_delta, ppdh_max_delta) > 0)
						{
							// goto again;
							ppdh_goto_again = 1;
						}

						if (!ppdh_goto_again)
						{
							// goto loop;
							ppdh_goto_loop = 1;
						}
					}

					if (!ppdh_goto_again && !ppdh_goto_loop)
					{
						ppdh_i = ppdh_i + 1;
					}
				}
			}

			if (!ppdh_goto_again && !ppdh_goto_loop)
			{
				ppdh_rnd = ppdh_rnd + ppdh_delta[1];
			}
		}
	}

	ppdh_out[0] = ppdh_rnd;

	return 1;
}

// bits must be >=2 and <=31; add and rem must be either positive or -1
int generate_prime(
	int genprime_out[1],
	int genprime_bits,
	int genprime_safe,
	int genprime_add,
	int genprime_rem)
{
	int genprime_found = 0;
	int genprime_t;
	int genprime_i;
	int genprime_is_prime_out[1];
	int genprime_mods[64];
	int genprime_checks = 1;
	int genprime_goto_loop = 1;

	if (genprime_bits < 2 || genprime_bits>31)
	{
		return 0;
	}
	else if (genprime_add == -1 && genprime_safe && genprime_bits < 6 && genprime_bits != 3)
	{
		/*
		 * The smallest safe prime (7) is three bits.
		 * But the following two safe primes with less than 6 bits (11, 23)
		 * are unreachable for BN_rand with BN_RAND_TOP_TWO.
		 */
		return 0;
	}

	// loop:
	genprime_goto_loop = 1;
	while (genprime_goto_loop)
	{
		genprime_goto_loop = 0;

		if (genprime_add == -1)
		{
			if (!probable_prime(genprime_out, genprime_bits, genprime_safe, genprime_mods))
			{
				return 0;
			}
		}
		else
		{
			if (!probable_prime_dh(genprime_out, genprime_bits, genprime_safe, genprime_mods, genprime_add, genprime_rem))
			{
				return 0;
			}
		}

		if (!genprime_safe)
		{
			if (!is_prime(genprime_is_prime_out, genprime_checks, genprime_out[0], 0))
			{
				return 0;
			}

			if (genprime_is_prime_out[0] == 0)
			{
				genprime_goto_loop = 1;
			}
		}
		else
		{
			genprime_t = genprime_out[0] / 2;

			genprime_i = 0;
			while (!genprime_goto_loop && genprime_i < genprime_checks)
			{
				if (!is_prime(genprime_is_prime_out, 1, genprime_out[0], 0))
				{
					return 0;
				}

				if (genprime_is_prime_out[0] == 0)
				{
					genprime_goto_loop = 1;
				}

				if (!genprime_goto_loop)
				{
					if (!is_prime(genprime_is_prime_out, 1, genprime_t, 0))
					{
						return 0;
					}

					if (genprime_is_prime_out[0] == 0)
					{
						genprime_goto_loop = 1;
					}

					if (!genprime_goto_loop)
					{
						genprime_i = genprime_i + 1;
					}
				}
			}
		}

		if (!genprime_goto_loop)
		{
			genprime_found = 1;
		}
	}

	return genprime_found;
}

// FFC

// n must be either >=2 and <=qbits or -1
int ffc_generate_privkey(
	int ffc_genprivkey_privkey_out[1],
	int ffc_genprivkey_q,
	int ffc_genprivkey_n)
{
	int ffc_genprivkey_qbits = get_bits_uint32(ffc_genprivkey_q);
	int ffc_genprivkey_two_power_n, ffc_genprivkey_m;

	if (ffc_genprivkey_qbits < 2 || ffc_genprivkey_qbits > 31)
	{
		return 0;
	}

	if (ffc_genprivkey_n == -1)
	{
		ffc_genprivkey_n = ffc_genprivkey_qbits;
	}

	if (ffc_genprivkey_n<2 || ffc_genprivkey_n>ffc_genprivkey_qbits)
	{
		return 0;
	}

	ffc_genprivkey_two_power_n = kTwoPowers[ffc_genprivkey_n];

	if (ffc_genprivkey_q < ffc_genprivkey_two_power_n)
	{
		ffc_genprivkey_m = ffc_genprivkey_q;
	}
	else
	{
		ffc_genprivkey_m = ffc_genprivkey_two_power_n;
	}

	while (1)
	{
		if (!rand_range(ffc_genprivkey_privkey_out, ffc_genprivkey_two_power_n))
		{
			return 0;
		}

		ffc_genprivkey_privkey_out[0] = ffc_genprivkey_privkey_out[0] + 1;

		if (ffc_genprivkey_privkey_out[0] < ffc_genprivkey_m)
		{
			return 1;
		}
	}
}
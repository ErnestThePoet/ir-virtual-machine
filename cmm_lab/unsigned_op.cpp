#include "unsigned_op.h"

int kTwoPowers[32];

int init_two_powers()
{
	int init_two_powers_i = 0;
	int init_two_powers_power = 1;

	while (init_two_powers_i < 32)
	{
		kTwoPowers[init_two_powers_i] = init_two_powers_power;
		init_two_powers_power = init_two_powers_power * 2;
		init_two_powers_i = init_two_powers_i + 1;
	}

	return 0;
}

// uint32 operations

int rshift_uint32(int rshift_uint32_x, int rshift_uint32_usr_a)
{
	if (rshift_uint32_usr_a >= 32 ||
		(rshift_uint32_x >= 0 && rshift_uint32_usr_a == 31))
	{
		return 0;
	}

	if (rshift_uint32_x < 0 && rshift_uint32_usr_a > 0)
	{
		// clear msb
		rshift_uint32_x = rshift_uint32_x + (-2147483648);
		// perform normal right shift
		rshift_uint32_x = rshift_uint32_x / 2;
		// reset msb
		rshift_uint32_x = rshift_uint32_x + 1073741824;
		rshift_uint32_usr_a = rshift_uint32_usr_a - 1;
	}

	// Now a<31
	return rshift_uint32_x / kTwoPowers[rshift_uint32_usr_a];
}

int lshift_uint32(int lshift_uint32_x, int lshift_uint32_a)
{
	if (lshift_uint32_a >= 32)
	{
		return 0;
	}

	return lshift_uint32_x * kTwoPowers[lshift_uint32_a];
}

int get_bits_uint32(int get_bits_uint32_a)
{
	int get_bits_uint32_bits = 0;
	while (rshift_uint32(get_bits_uint32_a, get_bits_uint32_bits))
	{
		get_bits_uint32_bits = get_bits_uint32_bits + 1;
	}

	return get_bits_uint32_bits;
}

int cmp_uint32(int cmp_uint32_a, int cmp_uint32_b)
{
	if ((cmp_uint32_a < 0 && cmp_uint32_b < 0) ||
		(cmp_uint32_a >= 0 && cmp_uint32_b >= 0))
	{
		if (cmp_uint32_a > cmp_uint32_b)
		{
			return 1;
		}
		else if (cmp_uint32_a < cmp_uint32_b)
		{
			return -1;
		}
		else
		{
			return 0;
		}
	}
	else if (cmp_uint32_a < 0 && cmp_uint32_b >= 0)
	{
		return 1;
	}
	else if (cmp_uint32_b < 0 && cmp_uint32_a >= 0)
	{
		return -1;
	}
}

int neg_uint32(int neg_uint32_a)
{
	return -1 - neg_uint32_a + 1;
}

int add_full_uint32(
	int add_full_uint32_carry_out[1],
	int add_full_uint32_a,
	int add_full_uint32_b)
{
	int add_full_uint32_dist_a = -1 - add_full_uint32_a;
	if (cmp_uint32(add_full_uint32_dist_a, add_full_uint32_b) < 0)
	{
		add_full_uint32_carry_out[0] = 1;
	}
	else
	{
		add_full_uint32_carry_out[0] = 0;
	}

	return add_full_uint32_a + add_full_uint32_b;
}

int sub_full_uint32(
	int sub_full_uint32_borrow_out[1],
	int sub_full_uint32_a,
	int sub_full_uint32_b)
{
	if (cmp_uint32(sub_full_uint32_a, sub_full_uint32_b) < 0)
	{
		sub_full_uint32_borrow_out[0] = 1;
	}
	else
	{
		sub_full_uint32_borrow_out[0] = 0;
	}

	return sub_full_uint32_a - sub_full_uint32_b;
}

int mul_uint32(int mul_uint32_uint64_out[2], int mul_uint32_a, int mul_uint32_b)
{
	// a=ah al=(ah<<16)+al
	// b=bh bl=(bh<<16)+bl
	// a*b=((ah*bh)<<32)+((ah*bl)<<16)+((al*bh)<<16)+(al*bl)
	//
	// |---------------(a*b)----------------|
	// |-----(a*b)_h-----||-----(a*b)_l-----|
	//
	// equals the sum of:
	//
	// |      32bit      |00...............00  ((ah*bh)<<32)
	// --------------------------------------
	//          |      32bit      |00......00  ((ah*bl)<<16)
	//          -----------------------------
	//          |      32bit      |00......00  ((al*bh)<<16)
	//          -----------------------------
	//                    |       32bit     |  (al*bl)
	//                    -------------------
	// Therefore:
	// (a*b)_l=(al*bl)+((ah*bl)<<16)+((al*bh)<<16) with carry=C (note C could be 0,1,2)
	// (a*b)_h=(ah*bh)+((ah*bl)>>16)+((al*bh)>>16)+C

	int mul_uint32_ah = rshift_uint32(mul_uint32_a, 16);
	int mul_uint32_al = mul_uint32_a - mul_uint32_ah * 65536;

	int mul_uint32_bh = rshift_uint32(mul_uint32_b, 16);
	int mul_uint32_bl = mul_uint32_b - mul_uint32_bh * 65536;

	int mul_uint32_abh = mul_uint32_ah * mul_uint32_bh +
		rshift_uint32(mul_uint32_ah * mul_uint32_bl, 16) +
		rshift_uint32((mul_uint32_al * mul_uint32_bh), 16);

	int mul_uint32_abl_carry[1];
	int mul_uint32_abl = add_full_uint32(
		mul_uint32_abl_carry,
		mul_uint32_al * mul_uint32_bl,
		((mul_uint32_ah * mul_uint32_bl) * 65536));

	mul_uint32_abh = mul_uint32_abh + mul_uint32_abl_carry[0];

	mul_uint32_abl = add_full_uint32(
		mul_uint32_abl_carry,
		mul_uint32_abl,
		((mul_uint32_al * mul_uint32_bh) * 65536));

	mul_uint32_abh = mul_uint32_abh + mul_uint32_abl_carry[0];

	mul_uint32_uint64_out[0] = mul_uint32_abh;
	mul_uint32_uint64_out[1] = mul_uint32_abl;

	return 0;
}

int div_mod_uint32(
	int div_mod_uint32_rem_out[1],
	int div_mod_uint32_a,
	int div_mod_uint32_b)
{
	// Calculate division with pen-and-paper method
	int div_mod_uint32_i;
	int div_mod_uint32_a_bits, div_mod_uint32_b_bits;
	int div_mod_uint32_rem = div_mod_uint32_a;
	int div_mod_uint32_rem_lshift_count = 0;
	int div_mod_uint32_result = 0;

	if (cmp_uint32(div_mod_uint32_a, div_mod_uint32_b) < 0)
	{
		div_mod_uint32_rem_out[0] = div_mod_uint32_a;
		return 0;
	}

	div_mod_uint32_a_bits = get_bits_uint32(div_mod_uint32_a);
	div_mod_uint32_b_bits = get_bits_uint32(div_mod_uint32_b);

	div_mod_uint32_b = div_mod_uint32_b * kTwoPowers[div_mod_uint32_a_bits - div_mod_uint32_b_bits];

	// iterate (a_bits-b_bits+1) rounds
	div_mod_uint32_i = div_mod_uint32_a_bits - div_mod_uint32_b_bits;
	while (div_mod_uint32_i >= 0)
	{
		div_mod_uint32_result = div_mod_uint32_result * 2;

		if (cmp_uint32(div_mod_uint32_rem, div_mod_uint32_b) >= 0)
		{
			div_mod_uint32_result = div_mod_uint32_result + 1;
			div_mod_uint32_rem = div_mod_uint32_rem - div_mod_uint32_b;
			div_mod_uint32_rem = div_mod_uint32_rem * 2;
			div_mod_uint32_rem_lshift_count = div_mod_uint32_rem_lshift_count + 1;
		}
		else
		{
			div_mod_uint32_b = rshift_uint32(div_mod_uint32_b, 1);
		}

		div_mod_uint32_i = div_mod_uint32_i - 1;
	}

	div_mod_uint32_rem_out[0] = rshift_uint32(div_mod_uint32_rem, div_mod_uint32_rem_lshift_count);

	return div_mod_uint32_result;
}

int div_uint32(int div_uint32_a, int div_uint32_b)
{
	int div_uint32_rem[1];
	return div_mod_uint32(div_uint32_rem, div_uint32_a, div_uint32_b);
}

int mod_uint32(int mod_uint32_a, int mod_uint32_b)
{
	int mod_uint32_rem[1];
	div_mod_uint32(mod_uint32_rem, mod_uint32_a, mod_uint32_b);
	return mod_uint32_rem[0];
}

// uint64 operations

int rshift_uint64(int rshift_uint64_out[2], int rshift_uint64_x[2], int rshift_uint64_a)
{
	int rshift_uint64_xh = rshift_uint64_x[0];
	int rshift_uint64_xl = rshift_uint64_x[1];
	if (rshift_uint64_a >= 64 ||
		(rshift_uint64_xh >= 0 && rshift_uint64_a == 63))
	{
		rshift_uint64_out[0] = 0;
		rshift_uint64_out[1] = 0;
		return 0;
	}

	rshift_uint64_out[0] = rshift_uint32(rshift_uint64_xh, rshift_uint64_a);
	rshift_uint64_out[1] = rshift_uint32(rshift_uint64_xl, rshift_uint64_a);

	if (rshift_uint64_a >= 32)
	{
		rshift_uint64_out[1] = rshift_uint64_out[1] +
			rshift_uint32(rshift_uint64_xh, rshift_uint64_a - 32);
	}
	else
	{
		rshift_uint64_out[1] = rshift_uint64_out[1] +
			(rshift_uint64_xh - rshift_uint64_out[0] * kTwoPowers[rshift_uint64_a]) *
			kTwoPowers[32 - rshift_uint64_a];
	}

	return 0;
}

int lshift_uint64(int lshift_uint64_out[2], int lshift_uint64_x[2], int lshift_uint64_a)
{
	if (lshift_uint64_a >= 64)
	{
		lshift_uint64_out[0] = 0;
		lshift_uint64_out[1] = 0;
		return 0;
	}

	if (lshift_uint64_a >= 32)
	{
		lshift_uint64_out[0] = lshift_uint64_x[1] * kTwoPowers[lshift_uint64_a - 32];
		lshift_uint64_out[1] = 0;
	}
	else
	{
		lshift_uint64_out[0] = lshift_uint64_x[0] * kTwoPowers[lshift_uint64_a] +
			rshift_uint32(lshift_uint64_x[1], 32 - lshift_uint64_a);
		lshift_uint64_out[1] = lshift_uint64_x[1] * kTwoPowers[lshift_uint64_a];
	}

	return 0;
}

int get_bits_uint64(int get_bits_uint64_a[2])
{
	int get_bits_uint64_bits = 0;
	int get_bits_uint64_shifted[2];

	rshift_uint64(get_bits_uint64_shifted, get_bits_uint64_a, get_bits_uint64_bits);

	while (get_bits_uint64_shifted[0] || get_bits_uint64_shifted[1])
	{
		get_bits_uint64_bits = get_bits_uint64_bits + 1;
		rshift_uint64(get_bits_uint64_shifted, get_bits_uint64_a, get_bits_uint64_bits);
	}

	return get_bits_uint64_bits;
}

int cmp_uint64(int cmp_uint64_a[2], int cmp_uint64_b[2])
{
	int cmp_uint64_result = cmp_uint32(cmp_uint64_a[0], cmp_uint64_b[0]);
	if (cmp_uint64_result)
	{
		return cmp_uint64_result;
	}

	return cmp_uint32(cmp_uint64_a[1], cmp_uint64_b[1]);
}

int add_full_uint64(
	int add_full_uint64_out[2],
	int add_full_uint64_carry_out[1],
	int add_full_uint64_a[2],
	int add_full_uint64_b[2])
{
	int add_full_uint64_low_carry[1];
	int add_full_uint64_high_carry[1];
	add_full_uint64_out[1] = add_full_uint32(
		add_full_uint64_low_carry, add_full_uint64_a[1], add_full_uint64_b[1]);
	add_full_uint64_out[0] = add_full_uint32(
		add_full_uint64_high_carry, add_full_uint64_a[0], add_full_uint64_b[0]);
	add_full_uint64_carry_out[0] = add_full_uint64_high_carry[0];
	add_full_uint64_out[0] = add_full_uint32(
		add_full_uint64_high_carry, add_full_uint64_out[0], add_full_uint64_low_carry[0]);
	add_full_uint64_carry_out[0] = add_full_uint64_carry_out[0] + add_full_uint64_high_carry[0];
	return 0;
}

int add_uint64(int add_uint64_out[2], int add_uint64_a[2], int add_uint64_b[2])
{
	int add_uint64_low_carry[1];
	add_uint64_out[1] = add_full_uint32(
		add_uint64_low_carry, add_uint64_a[1], add_uint64_b[1]);
	add_uint64_out[0] = add_uint64_a[0] + add_uint64_b[0] + add_uint64_low_carry[0];
	return 0;
}

int neg_uint64(int neg_uint64_out[2], int neg_uint64_a[2])
{
	int neg_uint64_inv[2];
	int neg_uint64_one[2];

	neg_uint64_inv[0] = -1 - neg_uint64_a[0];
	neg_uint64_inv[1] = -1 - neg_uint64_a[1];

	neg_uint64_one[0] = 0;
	neg_uint64_one[1] = 1;

	add_uint64(neg_uint64_out, neg_uint64_inv, neg_uint64_one);

	return 0;
}

int sub_full_uint64(
	int sub_full_uint64_out[2],
	int sub_full_uint64_borrow_out[1],
	int sub_full_uint64_a[2],
	int sub_full_uint64_b[2])
{
	int sub_full_uint64_neg_b[2];

	if (cmp_uint64(sub_full_uint64_a, sub_full_uint64_b) < 0)
	{
		sub_full_uint64_borrow_out[0] = 1;
	}
	else
	{
		sub_full_uint64_borrow_out[0] = 0;
	}

	neg_uint64(sub_full_uint64_neg_b, sub_full_uint64_b);

	add_uint64(sub_full_uint64_out, sub_full_uint64_a, sub_full_uint64_neg_b);

	return 0;
}

int sub_uint64(int sub_uint64_out[2], int sub_uint64_a[2], int sub_uint64_b[2])
{
	int sub_uint64_neg_b[2];

	neg_uint64(sub_uint64_neg_b, sub_uint64_b);

	add_uint64(sub_uint64_out, sub_uint64_a, sub_uint64_neg_b);

	return 0;
}

int mul_uint64(int mul_uint64_out[2], int mul_uint64_a[2], int mul_uint64_b[2])
{
	// a=ah al=(ah<<32)+al
	// b=bh bl=(bh<<32)+bl
	// a*b=((ah*bh)<<64)+((ah*bl)<<32)+((al*bh)<<32)+(al*bl)
	//
	// |---------------(a*b)----------------|
	// |-----(a*b)_h-----||-----(a*b)_l-----|
	//
	// equals the sum of:
	//
	// |      64bit      |00...............00  ((ah*bh)<<64)
	// --------------------------------------
	//          |      64bit      |00......00  ((ah*bl)<<32)
	//          -----------------------------
	//          |      64bit      |00......00  ((al*bh)<<32)
	//          -----------------------------
	//                    |       64bit     |  (al*bl)
	//                    -------------------
	// Therefore:
	// (a*b)_l=(al*bl)+((ah*bl)<<32)+((al*bh)<<32) with carry=C (note C could be 0,1,2)
	// (a*b)_h=(ah*bh)+((ah*bl)>>32)+((al*bh)>>32)+C
	// We only need (a*b)_l

	int mul_uint64_albl[2];
	int mul_uint64_ahbl[2];
	int mul_uint64_albh[2];

	mul_uint32(mul_uint64_albl, mul_uint64_a[1], mul_uint64_b[1]);

	mul_uint32(mul_uint64_ahbl, mul_uint64_a[0], mul_uint64_b[1]);
	lshift_uint64(mul_uint64_ahbl, mul_uint64_ahbl, 32);

	mul_uint32(mul_uint64_albh, mul_uint64_a[1], mul_uint64_b[0]);
	lshift_uint64(mul_uint64_albh, mul_uint64_albh, 32);

	add_uint64(mul_uint64_out, mul_uint64_albl, mul_uint64_ahbl);
	add_uint64(mul_uint64_out, mul_uint64_out, mul_uint64_albh);

	return 0;
}

int div_mod_uint64(
	int div_mod_uint64_out[2],
	int div_mod_uint64_rem_out[2],
	int div_mod_uint64_a[2],
	int div_mod_uint64_b[2])
{
	int div_mod_uint64_i;
	int div_mod_uint64_a_bits, div_mod_uint64_b_bits;
	int div_mod_uint64_slb[2];
	int div_mod_uint64_rem[2];
	int div_mod_uint64_rem_lshift_count = 0;
	int div_mod_uint64_result[2];
	int div_mod_uint64_one[2];

	div_mod_uint64_rem[0] = div_mod_uint64_a[0];
	div_mod_uint64_rem[1] = div_mod_uint64_a[1];

	div_mod_uint64_result[0] = 0;
	div_mod_uint64_result[1] = 0;

	div_mod_uint64_one[0] = 0;
	div_mod_uint64_one[1] = 1;

	if (cmp_uint64(div_mod_uint64_a, div_mod_uint64_b) < 0)
	{
		div_mod_uint64_rem_out[0] = div_mod_uint64_a[0];
		div_mod_uint64_rem_out[1] = div_mod_uint64_a[1];

		div_mod_uint64_out[0] = 0;
		div_mod_uint64_out[1] = 0;

		return 0;
	}

	div_mod_uint64_a_bits = get_bits_uint64(div_mod_uint64_a);
	div_mod_uint64_b_bits = get_bits_uint64(div_mod_uint64_b);

	lshift_uint64(div_mod_uint64_slb, div_mod_uint64_b, div_mod_uint64_a_bits - div_mod_uint64_b_bits);

	div_mod_uint64_i = div_mod_uint64_a_bits - div_mod_uint64_b_bits;
	while (div_mod_uint64_i >= 0)
	{
		lshift_uint64(div_mod_uint64_result, div_mod_uint64_result, 1);

		if (cmp_uint64(div_mod_uint64_rem, div_mod_uint64_slb) >= 0)
		{
			add_uint64(div_mod_uint64_result, div_mod_uint64_result, div_mod_uint64_one);
			sub_uint64(div_mod_uint64_rem, div_mod_uint64_rem, div_mod_uint64_slb);
			lshift_uint64(div_mod_uint64_rem, div_mod_uint64_rem, 1);
			div_mod_uint64_rem_lshift_count = div_mod_uint64_rem_lshift_count + 1;
		}
		else
		{
			rshift_uint64(div_mod_uint64_slb, div_mod_uint64_slb, 1);
		}

		div_mod_uint64_i = div_mod_uint64_i - 1;
	}

	rshift_uint64(div_mod_uint64_rem_out, div_mod_uint64_rem, div_mod_uint64_rem_lshift_count);

	div_mod_uint64_out[0] = div_mod_uint64_result[0];
	div_mod_uint64_out[1] = div_mod_uint64_result[1];

	return 0;
}

int div_uint64(int div_uint64_out[2], int div_uint64_a[2], int div_uint64_b[2])
{
	int div_uint64_rem[2];
	div_mod_uint64(div_uint64_out, div_uint64_rem, div_uint64_a, div_uint64_b);
	return 0;
}

int mod_uint64(int mod_uint64_out[2], int mod_uint64_a[2], int mod_uint64_b[2])
{
	int mod_uint64_quot[2];
	div_mod_uint64(mod_uint64_quot, mod_uint64_out, mod_uint64_a, mod_uint64_b);
	return 0;
}

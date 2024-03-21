#ifndef UNSIGNED_OP_H_
#define UNSIGNED_OP_H_

extern int kTwoPowers[32]; // [31] is negative

// initializations

int init_two_powers();

// uint32 operations

int rshift_uint32(int rshift_uint32_x, int rshift_uint32_usr_a);

int lshift_uint32(int lshift_uint32_x, int lshift_uint32_a);

int get_bits_uint32(int get_bits_uint32_a);

int cmp_uint32(int cmp_uint32_a, int cmp_uint32_b);

int neg_uint32(int neg_uint32_a);

int add_full_uint32(
	int add_full_uint32_carry_out[1],
	int add_full_uint32_a,
	int add_full_uint32_b);

int sub_full_uint32(
	int sub_full_uint32_borrow_out[1],
	int sub_full_uint32_a,
	int sub_full_uint32_b);

int mul_uint32(int mul_uint32_uint64_out[2], int mul_uint32_a, int mul_uint32_b);

int div_mod_uint32(
	int div_mod_uint32_rem_out[1],
	int div_mod_uint32_a,
	int div_mod_uint32_b);

int div_uint32(int div_uint32_a, int div_uint32_b);

int mod_uint32(int mod_uint32_a, int mod_uint32_b);

// uint64 operations

int rshift_uint64(int rshift_uint64_out[2], int rshift_uint64_x[2], int rshift_uint64_a);

int lshift_uint64(int lshift_uint64_out[2], int lshift_uint64_x[2], int lshift_uint64_a);

int get_bits_uint64(int get_bits_uint64_a[2]);

int cmp_uint64(int cmp_uint64_a[2], int cmp_uint64_b[2]);

int add_full_uint64(
	int add_full_uint64_out[2],
	int add_full_uint64_carry_out[1],
	int add_full_uint64_a[2],
	int add_full_uint64_b[2]);

int add_uint64(int add_uint64_out[2], int add_uint64_a[2], int add_uint64_b[2]);

int neg_uint64(int neg_uint64_out[2], int neg_uint64_a[2]);

int sub_full_uint64(
	int sub_full_uint64_out[2],
	int sub_full_uint64_borrow_out[1],
	int sub_full_uint64_a[2],
	int sub_full_uint64_b[2]);

int sub_uint64(int sub_uint64_out[2], int sub_uint64_a[2], int sub_uint64_b[2]);

int mul_uint64(int mul_uint64_out[2], int mul_uint64_a[2], int mul_uint64_b[2]);

int div_mod_uint64(
	int div_mod_uint64_out[2],
	int div_mod_uint64_rem_out[2],
	int div_mod_uint64_a[2],
	int div_mod_uint64_b[2]);

int div_uint64(int div_uint64_out[2], int div_uint64_a[2], int div_uint64_b[2]);

int mod_uint64(int mod_uint64_out[2], int mod_uint64_a[2], int mod_uint64_b[2]);

#endif
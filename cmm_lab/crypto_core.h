#ifndef CRYPTO_CORE_H_
#define CRYPTO_CORE_H_

#include "unsigned_op.h"
#include "common.h"

struct FFCParams
{
	int g;
	int p;
	int q;
};

int init_primes();

int is_bit_set(int is_bit_set_x, int is_bit_set_n);

int mul_mod(int mul_mod_a, int mul_mod_b, int mul_mod_p);
int exp_mod(int exp_mod_a, int exp_mod_b, int exp_mod_p);

int rand_bits(int rand_bits_n, int rand_bits_top, int rand_bits_bottom);
int rand_range(int rand_range_out[1], int rand_range_range);

int miller_rabin_is_prime(int mr_out[1], int mr_w, int mr_iterations);
int is_prime(
	int is_prime_out[1],
	int is_prime_checks,
	int is_prime_w,
	int is_prime_do_trial_division);
int probable_prime(int pp_out[1], int pp_bits, int pp_safe, int pp_mods[64]);
int probable_prime_dh(
	int ppdh_out[1],
	int ppdh_bits,
	int ppdh_safe,
	int ppdh_mods[64],
	int ppdh_add,
	int ppdh_rem);
int generate_prime(
	int genprime_out[1],
	int genprime_bits,
	int genprime_safe,
	int genprime_add,
	int genprime_rem);

int ffc_generate_privkey(
	int ffc_genprivkey_privkey_out[1],
	int ffc_genprivkey_q,
	int ffc_genprivkey_n);

#endif
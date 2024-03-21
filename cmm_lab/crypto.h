#ifndef CRYPTO_H_
#define CRYPTO_H_

#include "unsigned_op.h"
#include "common.h"

int init_primes();

int is_bit_set(int is_bit_set_x, int is_bit_set_n);

int mul_mod(int mul_mod_a, int mul_mod_b, int mul_mod_p);
int exp_mod(int exp_mod_a, int exp_mod_b, int exp_mod_p);

int rand_bits(int rand_bits_n, int rand_bits_top, int rand_bits_bottom);
int rand_range(int rand_range_out[1], int rand_range_range);

int miller_rabin_is_prime(int mr_out[1], int mr_w, int mr_iterations);
int is_prime(int is_prime_out[1], int is_prime_checks, int is_prime_w, int is_prime_do_trial_division);
int probable_prime(int out[1], int bits, int safe, int mods[64]);
int probable_prime_dh(int out[1], int bits, int safe, int mods[64], int add, int rem);
int generate_prime(int out[1], int bits, int safe, int add, int rem);



#endif
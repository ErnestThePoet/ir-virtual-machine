#include "dh.h"

int dh_generate_paremeters(
	int dh_genparam_p_out[1],
	int dh_genparam_prime_len,
	int dh_genparam_generator)
{
	int dh_genparam_t1, dh_genparam_t2;

	if (dh_genparam_prime_len < 2 || dh_genparam_prime_len>31)
	{
		return 0;
	}

	if (dh_genparam_generator <= 1)
	{
		return 0;
	}

	if (dh_genparam_generator == 2)
	{
		dh_genparam_t1 = 24;
		dh_genparam_t2 = 23;
	}
	else if (dh_genparam_generator == 5)
	{
		dh_genparam_t1 = 60;
		dh_genparam_t2 = 59;
	}
	else
	{
		dh_genparam_t1 = 12;
		dh_genparam_t2 = 11;
	}

	return generate_prime(dh_genparam_p_out, dh_genparam_prime_len, 1, dh_genparam_t1, dh_genparam_t2);
}
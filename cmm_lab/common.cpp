#include "common.h"

static int kNext;

int mod(int mod_x, int mod_y)
{
	return mod_x - mod_y * (mod_x / mod_y);
}

int srand32(int srand32_seed)
{
	kNext = srand32_seed;
	return 0;
}

int rand32()
{
	int rand32_result;

	kNext = kNext * 1103515245;
	kNext = kNext + 12345;
	rand32_result = mod(kNext / 65536, 2048);

	kNext = kNext * 1103515245;
	kNext = kNext + 12345;
	rand32_result = rand32_result * 1024;
	rand32_result = rand32_result + mod(kNext / 65536, 1024);

	kNext = kNext * 1103515245;
	kNext = kNext + 12345;
	rand32_result = rand32_result * 1024;
	rand32_result = rand32_result + mod(kNext / 65536, 1024);

	return rand32_result;
}
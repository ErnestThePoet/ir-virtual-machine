#ifndef UTIL_H_
#define UTIL_H_

#include <cstdint>

inline void u64(int out[2], uint64_t a)
{
	out[0] = a >> 32;
	out[1] = a % (1ULL << 32);
}

#endif
#ifndef CMM_WRAPPERS_H_
#define CMM_WRAPPERS_H_

#include <iostream>

inline void write(int x)
{
	std::cout << x << std::endl;
}

inline int read()
{
	int x = 0;
	std::cin >> x;
	return x;
}

#endif
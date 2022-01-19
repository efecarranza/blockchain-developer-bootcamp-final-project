There are many things I'm considering to avoid pitfalls:

1. Using specific pragma version (0.8.11). I'm using 0.8 because it's the latest version and comes with SafeMath included.
2. I'm using checks-effects interactions, where I'm checking values before I send them out.
3. Using require for validation, and not using modifiers as they obscure the code.

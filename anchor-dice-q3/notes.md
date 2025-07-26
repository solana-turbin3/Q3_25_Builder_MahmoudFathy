
## Debugging

- Error spit by `#[program]` macro

```
error: custom attribute panicked
  --> programs/anchor-dice-q3/src/lib.rs:14:1
   |
14 | #[program]
   | ^^^^^^^^^^
   |
   = help: message: Safety checks failed: 
                   /home/dom/Developer/turbin-3-builders/anchor-dice-q3/programs/anchor-dice-q3/src/instructions/place_bet.rs:14:0
                   Struct field "house" is unsafe, but is not documented.
                   Please add a `/// CHECK:` doc comment explaining why no checks through types are necessary.
                   Alternatively, for reasons like quick prototyping, you may disable the safety checks
                   by using the `skip-lint` option.
                   See https://www.anchor-lang.com/docs/the-accounts-struct#safety-checks for more information.
```
  - This was dealt with by removing `UncheckedAccount`




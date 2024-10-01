# Footnote

- Link 2 [^2] shoud be indexed as 1

- Link 1 [^1] shoud be indexed as 2

- Link Named [^named] should not be changed

`Link 2.1 [^2] shoud not be re-indexed`

```markdown
Link 2.2 [^2] shoud not be re-indexed
Link 3 [^3] shoud not be re-indexed

[^3]: https://www.example.com/c
```

<div><div>Link 2.3 [^2] should not be re-indexed</div></div>

[^1]: https://www.example.com/b
[^2]: https://www.example.com/a
[^named]: https://www.example.com/named


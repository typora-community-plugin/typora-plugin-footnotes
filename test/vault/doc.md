# Footnote

- Link 2 [^2] should be indexed as 1

- Link 1 [^1] should be indexed as 2

- Link Named [^named] should not be changed

`Link 2.1 [^2] should not be re-indexed`

```markdown
Link 2.2 [^2] should not be re-indexed
Link 3 [^3] should not be re-indexed

[^3]: https://www.example.com/c
```

<div><div>Link 2.3 [^2] in HTML should not be re-indexed</div></div>

[^1]: https://www.example.com/b
[^2]: https://www.example.com/a
[^named]: https://www.example.com/named


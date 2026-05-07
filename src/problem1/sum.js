function sum_to_n_a(n) {
  let sum = 0
  while (n > 0) {
    sum += n
    n--
  }
  return sum
}

function sum_to_n_b(n) {
  return (n * (n + 1)) / 2
}

function sum_to_n_c(n) {
  return Array.from({ length: n }, (_, i) => i + 1)
    .reduce((a, b) => a + b, 0)
}

console.log(sum_to_n_a(5), 'sum_to_n_a', 'n = 5')
console.log(sum_to_n_b(6), 'sum_to_n_b', 'n = 6')
console.log(sum_to_n_c(7), 'sum_to_n_c', 'n = 7')
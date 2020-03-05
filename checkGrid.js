const sum = (a, b) => (a | 0) + (b | 0);
const invalidSet = list => {
  return list.some(
    subSet => new Set(subSet).size !== 9 || subSet.reduce(sum) !== 45
  );
};

onmessage = event => {
  const { data } = event;
  const { subGrids, rows } = data;

  const { length } = rows;
  const columns = Array.from({ length }, () => []);
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      columns[i].push(rows[j][i]);
    }
  }

  postMessage(invalidSet(subGrids) || invalidSet(rows) || invalidSet(columns));
  close();
};

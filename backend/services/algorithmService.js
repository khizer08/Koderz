/**
 * AlgorithmService
 * Handles step generation, runtime simulation, and benchmark data
 */
class AlgorithmService {
  /**
   * Generate step-by-step sort trace for visualization
   */
  static generateSortTrace(algorithm, arr) {
    const input = [...arr];
    switch (algorithm) {
      case 'bubble': return this.bubbleSortTrace(input);
      case 'selection': return this.selectionSortTrace(input);
      case 'insertion': return this.insertionSortTrace(input);
      case 'merge': return this.mergeSortTrace(input);
      case 'quick': return this.quickSortTrace(input);
      default: return [];
    }
  }

  static bubbleSortTrace(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: [], description: 'Starting Bubble Sort' });

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ array: [...a], comparing: [j, j + 1], swapped: [], sorted: Array.from({ length: i }, (_, k) => n - 1 - k), description: `Comparing ${a[j]} and ${a[j + 1]}` });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          steps.push({ array: [...a], comparing: [], swapped: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k), description: `Swapped ${a[j + 1]} and ${a[j]}` });
        }
      }
    }
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: Array.from({ length: n }, (_, k) => k), description: 'Array sorted!' });
    return steps;
  }

  static selectionSortTrace(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: [], description: 'Starting Selection Sort' });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        steps.push({ array: [...a], comparing: [minIdx, j], swapped: [], sorted: Array.from({ length: i }, (_, k) => k), description: `Looking for minimum: comparing index ${minIdx} (${a[minIdx]}) with index ${j} (${a[j]})` });
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        steps.push({ array: [...a], comparing: [], swapped: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k), description: `Placed minimum ${a[i]} at position ${i}` });
      }
    }
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: Array.from({ length: n }, (_, k) => k), description: 'Array sorted!' });
    return steps;
  }

  static insertionSortTrace(arr) {
    const steps = [];
    const a = [...arr];
    const n = a.length;
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: [0], description: 'Starting Insertion Sort — first element is trivially sorted' });

    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      steps.push({ array: [...a], comparing: [i], swapped: [], sorted: Array.from({ length: i }, (_, k) => k), description: `Inserting ${key} into sorted portion` });

      while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        steps.push({ array: [...a], comparing: [j, j + 1], swapped: [j + 1], sorted: [], description: `Shifting ${a[j]} right` });
        j--;
      }
      a[j + 1] = key;
      steps.push({ array: [...a], comparing: [], swapped: [j + 1], sorted: Array.from({ length: i + 1 }, (_, k) => k), description: `${key} inserted at position ${j + 1}` });
    }
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: Array.from({ length: n }, (_, k) => k), description: 'Array sorted!' });
    return steps;
  }

  static mergeSortTrace(arr) {
    const steps = [];
    const a = [...arr];
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: [], description: 'Starting Merge Sort — dividing array' });

    const mergeSort = (arr, left, right) => {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      steps.push({ array: [...a], comparing: [left, right], swapped: [], sorted: [], description: `Dividing: indices ${left} to ${right}, mid=${mid}` });
      mergeSort(arr, left, mid);
      mergeSort(arr, mid + 1, right);
      merge(arr, left, mid, right);
    };

    const merge = (arr, left, mid, right) => {
      const L = arr.slice(left, mid + 1);
      const R = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      while (i < L.length && j < R.length) {
        steps.push({ array: [...a], comparing: [left + i, mid + 1 + j], swapped: [], sorted: [], description: `Merging: comparing ${L[i]} and ${R[j]}` });
        if (L[i] <= R[j]) { arr[k] = L[i]; i++; }
        else { arr[k] = R[j]; j++; }
        a[k] = arr[k];
        k++;
      }
      while (i < L.length) { arr[k] = L[i]; a[k] = arr[k]; i++; k++; }
      while (j < R.length) { arr[k] = R[j]; a[k] = arr[k]; j++; k++; }
      steps.push({ array: [...a], comparing: [], swapped: Array.from({ length: right - left + 1 }, (_, idx) => left + idx), sorted: [], description: `Merged section [${left}..${right}]` });
    };

    mergeSort(a, 0, a.length - 1);
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: Array.from({ length: a.length }, (_, k) => k), description: 'Array sorted!' });
    return steps;
  }

  static quickSortTrace(arr) {
    const steps = [];
    const a = [...arr];
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: [], description: 'Starting Quick Sort' });

    const quickSort = (arr, low, high) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      }
    };

    const partition = (arr, low, high) => {
      const pivot = arr[high];
      steps.push({ array: [...a], comparing: [high], swapped: [], sorted: [], description: `Pivot selected: ${pivot} at index ${high}` });
      let i = low - 1;
      for (let j = low; j < high; j++) {
        steps.push({ array: [...a], comparing: [j, high], swapped: [], sorted: [], description: `Comparing ${arr[j]} with pivot ${pivot}` });
        if (arr[j] <= pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          a[i] = arr[i]; a[j] = arr[j];
          if (i !== j) steps.push({ array: [...a], comparing: [], swapped: [i, j], sorted: [], description: `Swapped ${arr[j]} and ${arr[i]}` });
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      a[i + 1] = arr[i + 1]; a[high] = arr[high];
      steps.push({ array: [...a], comparing: [], swapped: [i + 1], sorted: [i + 1], description: `Pivot ${pivot} placed at final position ${i + 1}` });
      return i + 1;
    };

    quickSort(a, 0, a.length - 1);
    steps.push({ array: [...a], comparing: [], swapped: [], sorted: Array.from({ length: a.length }, (_, k) => k), description: 'Array sorted!' });
    return steps;
  }

  /**
   * Generate benchmark data for comparison charts
   */
  static generateBenchmarkData(algo1, algo2, sizes = [10, 50, 100, 500, 1000, 5000]) {
    const complexityMap = {
      bubble: (n) => n * n,
      selection: (n) => n * n,
      insertion: (n) => n * n * 0.5,
      merge: (n) => n * Math.log2(n),
      quick: (n) => n * Math.log2(n) * 0.9,
      binary: (n) => Math.log2(n),
    };

    const scale = (algo, n) => {
      const fn = complexityMap[algo] || ((n) => n);
      return Math.round(fn(n));
    };

    return sizes.map((n) => ({
      n,
      [algo1]: scale(algo1, n),
      [algo2]: scale(algo2, n),
    }));
  }
}

module.exports = AlgorithmService;

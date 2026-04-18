#!/usr/bin/env python3
"""
Koderz — Python AST Complexity Analyzer
Reads JSON from stdin: { "code": "...", "language": "python" }
Outputs JSON to stdout with complexity analysis
"""

import ast
import json
import sys
import re


class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.loop_depth = 0
        self.max_loop_depth = 0
        self.loop_count = 0
        self.nested_loop_count = 0
        self.recursive_calls = set()
        self.function_names = set()
        self.has_log_pattern = False
        self.patterns = []

    def visit_FunctionDef(self, node):
        self.function_names.add(node.name)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node):
        self.function_names.add(node.name)
        self.generic_visit(node)

    def _visit_loop(self, node):
        self.loop_count += 1
        self.loop_depth += 1
        self.max_loop_depth = max(self.max_loop_depth, self.loop_depth)
        if self.loop_depth > 1:
            self.nested_loop_count += 1
        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_For(self, node):
        self._visit_loop(node)

    def visit_While(self, node):
        # Check for halving patterns: i //= 2, i >>= 1, n = n // 2
        if self._is_log_loop(node):
            self.has_log_pattern = True
        self._visit_loop(node)

    def _is_log_loop(self, node):
        for child in ast.walk(node):
            if isinstance(child, ast.AugAssign):
                if isinstance(child.op, (ast.FloorDiv, ast.RShift)):
                    return True
        return False

    def visit_Call(self, node):
        # Detect recursive calls
        if isinstance(node.func, ast.Name):
            if node.func.id in self.function_names:
                self.recursive_calls.add(node.func.id)
        self.generic_visit(node)


def analyze_python(code: str) -> dict:
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {
            "error": f"Syntax error: {str(e)}",
            "timeComplexity": "Unknown",
            "spaceComplexity": "Unknown",
            "detectedPatterns": [],
            "confidence": 0,
        }

    visitor = ComplexityVisitor()
    visitor.visit(tree)

    # Determine complexities
    patterns = []
    time_complexity = "O(1)"
    space_complexity = "O(1)"
    confidence = 85

    has_recursion = len(visitor.recursive_calls) > 0

    if has_recursion and visitor.has_log_pattern:
        time_complexity = "O(log n)"
        space_complexity = "O(log n)"
        patterns.append("Recursive with halving (Binary Search pattern)")
        confidence = 88
    elif has_recursion and visitor.max_loop_depth >= 1:
        time_complexity = "O(n log n)"
        space_complexity = "O(n)"
        patterns.append("Recursion with loops (Merge Sort pattern)")
        confidence = 82
    elif has_recursion:
        time_complexity = "O(n)"
        space_complexity = "O(n)"
        patterns.append(f"Recursion ({', '.join(visitor.recursive_calls)})")
        confidence = 80
    elif visitor.max_loop_depth >= 3:
        time_complexity = "O(n³)"
        patterns.append("Triple nested loops")
        confidence = 90
    elif visitor.max_loop_depth >= 2:
        time_complexity = "O(n²)"
        patterns.append("Nested loops")
        confidence = 90
    elif visitor.has_log_pattern:
        time_complexity = "O(log n)"
        patterns.append("Logarithmic loop (halving)")
        confidence = 85
    elif visitor.loop_count >= 1:
        time_complexity = "O(n)"
        patterns.append(f"Single loop ({visitor.loop_count} loop(s))")
        confidence = 88

    # Space complexity heuristics
    if has_recursion and "O(1)" == space_complexity:
        space_complexity = "O(n)"
    if visitor.max_loop_depth == 0 and not has_recursion:
        space_complexity = "O(1)"

    explanation = generate_explanation(time_complexity, patterns)
    suggestions = generate_suggestions(time_complexity, patterns, has_recursion, visitor.nested_loop_count)

    return {
        "timeComplexity": time_complexity,
        "spaceComplexity": space_complexity,
        "detectedPatterns": patterns,
        "loops": visitor.loop_count,
        "nestedLoops": visitor.nested_loop_count,
        "recursion": has_recursion,
        "maxLoopDepth": visitor.max_loop_depth,
        "confidence": confidence,
        "explanation": explanation,
        "suggestions": suggestions,
    }


def generate_explanation(complexity, patterns):
    explanations = {
        "O(1)": "No loops or recursion detected. This code executes in constant time — the runtime does not grow with input size.",
        "O(log n)": "A logarithmic pattern was detected. The search/computation space is halved each iteration, making this highly efficient for large inputs.",
        "O(n)": "A single pass through the input was detected. Runtime grows linearly with input size — this is generally considered efficient.",
        "O(n log n)": "A divide-and-conquer or recursive pattern with a loop was detected. This is the optimal complexity for comparison-based sorting.",
        "O(n²)": "Nested loops detected. For every element, the inner loop processes all elements again — performance degrades quickly with larger inputs.",
        "O(n³)": "Triple nested loops detected. This is extremely slow for large inputs and should be optimized if possible.",
    }
    base = explanations.get(complexity, f"Complexity estimated as {complexity} based on AST pattern analysis.")
    if patterns:
        base += f" Patterns found: {', '.join(patterns)}."
    return base


def generate_suggestions(complexity, patterns, has_recursion, nested_loops):
    suggestions = []
    if complexity == "O(n²)":
        suggestions.append("Replace nested loops with a hash map for O(n) average-case lookup.")
        suggestions.append("Consider if sorting the input first would allow a more efficient single-pass solution.")
        suggestions.append("Two-pointer or sliding window technique may reduce to O(n).")
    if complexity == "O(n³)":
        suggestions.append("Investigate if the innermost loop can be replaced with a precomputed data structure.")
        suggestions.append("Matrix problems with O(n³) can sometimes be solved with O(n²) DP approaches.")
    if has_recursion and complexity not in ("O(log n)", "O(n log n)"):
        suggestions.append("Add memoization (functools.lru_cache) to avoid redundant recursive calls.")
        suggestions.append("Consider an iterative approach to eliminate call stack overhead.")
    if complexity == "O(n)":
        suggestions.append("Linear time is good! Verify no hidden O(n) operations inside loop bodies (e.g., list.index(), 'in' on lists).")
    if complexity == "O(log n)":
        suggestions.append("Excellent efficiency! Ensure the input array is sorted before calling this function.")
    return suggestions


def main():
    raw = sys.stdin.read().strip()
    try:
        payload = json.loads(raw)
        code = payload.get("code", "")
        language = payload.get("language", "python")
    except json.JSONDecodeError:
        code = raw
        language = "python"

    if language != "python":
        # Basic heuristic for non-Python (JS, Java, etc.)
        result = analyze_generic(code)
    else:
        result = analyze_python(code)

    print(json.dumps(result))


def analyze_generic(code):
    """Regex-based heuristic for non-Python languages"""
    loop_pattern = re.compile(r'\b(for|while|forEach|map|filter|reduce)\b')
    loops = len(loop_pattern.findall(code))

    lines = code.split('\n')
    max_depth = 0
    current_depth = 0
    for line in lines:
        stripped = line.strip()
        if loop_pattern.search(stripped):
            current_depth += 1
            max_depth = max(max_depth, current_depth)
        if stripped == '}':
            current_depth = max(0, current_depth - 1)

    recursion = bool(re.search(r'function\s+(\w+)[^{]*\{[^}]*\1\s*\(', code, re.DOTALL))

    if max_depth >= 2:
        tc = "O(n²)"
    elif loops >= 1:
        tc = "O(n)"
    elif recursion:
        tc = "O(n)"
    else:
        tc = "O(1)"

    return {
        "timeComplexity": tc,
        "spaceComplexity": "O(1)" if not recursion else "O(n)",
        "detectedPatterns": ["Heuristic analysis (non-Python)"],
        "loops": loops,
        "nestedLoops": max(0, max_depth - 1),
        "recursion": recursion,
        "confidence": 65,
        "explanation": f"Generic heuristic analysis. Detected {loops} loop(s), max nesting depth {max_depth}.",
        "suggestions": ["For deeper analysis, paste Python code for AST-level inspection."],
    }


if __name__ == "__main__":
    main()

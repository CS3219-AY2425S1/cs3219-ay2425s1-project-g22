export const TYPESCRIPT_TEMPLATE = `
  function solution() {
    // Your code here
  }
`;
export const JAVASCRIPT_TEMPLATE = `
function solution() {
  // Your code here
}`;
export const PYTHON_TEMPLATE = `
def solution():
  # Your code here
`;
export const JAVA_TEMPLATE = `
public class Main {
  public static void main(String[] args) {
    // Your code here
  }
}`;
export const CPP_TEMPLATE = `
#include <iostream>
using namespace std;

int main() {
  // Your code here
  return 0;
}`;
export const CSHARP_TEMPLATE = `
using System;

class Program {
  static void Main() {
    // Your code here
  }
}`;

export function getTemplate(language: string): string {
  switch (language) {
    case 'typescript':
      return TYPESCRIPT_TEMPLATE;
    case 'javascript':
      return JAVASCRIPT_TEMPLATE;
    case 'python':
      return PYTHON_TEMPLATE;
    case 'java':
      return JAVA_TEMPLATE;
    case 'cpp':
      return CPP_TEMPLATE;
    case 'csharp': // Assuming 'csharp' for C#
      return CSHARP_TEMPLATE;
    default:
      return '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const process = document.querySelector('.process');
    const result = document.querySelector('.result');
    const buttons = document.querySelectorAll('button');

    let currentInput = '0';
    let currentOperation = '';
    let previousInput = '';
    let shouldResetInput = false;
    let lastOperator = '';

    const operators = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '×': (a, b) => a * b,
        '÷': (a, b) => b !== 0 ? a / b : 'Error'
    };

    function formatResult(number) {
        if (number === 'Error') return 'Error';
        
        const numStr = number.toString();
        
        // 如果数字长度超过10位
        if (numStr.length > 10) {
            // 使用科学计数法
            const formatted = Number(number).toExponential(4);
            // 如果科学计数法结果仍然超过10位，截断处理
            return formatted.length > 10 ? formatted.slice(0, 10) : formatted;
        }
        
        return numStr;
    }

    function updateDisplay() {
        result.textContent = formatResult(currentInput);
        process.textContent = currentOperation;
    }

    function calculate(expression) {
        if (!expression) return 0;

        // 分割表达式为数字和运算符，同时保留负号
        const tokens = [];
        let currentNumber = '';
        let isNegative = false;

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            if ('+-×÷'.includes(char)) {
                if (currentNumber !== '' || isNegative) {
                    tokens.push(isNegative ? '-' + currentNumber : currentNumber);
                    currentNumber = '';
                    isNegative = false;
                }
                if (char === '-' && (i === 0 || '+-×÷'.includes(expression[i-1]))) {
                    isNegative = true;
                } else {
                    tokens.push(char);
                }
            } else {
                currentNumber += char;
            }
        }
        if (currentNumber !== '' || isNegative) {
            tokens.push(isNegative ? '-' + currentNumber : currentNumber);
        }
        
        // 先处理乘除法
        for (let i = 1; i < tokens.length; i += 2) {
            if (tokens[i] === '×' || tokens[i] === '÷') {
                const a = parseFloat(tokens[i - 1]);
                const b = parseFloat(tokens[i + 1]);
                const result = operators[tokens[i]](a, b);
                if (result === 'Error') return 'Error';
                tokens.splice(i - 1, 3, result.toString());
                i -= 2;
            }
        }

        // 再处理加减法
        let result = parseFloat(tokens[0]);
        for (let i = 1; i < tokens.length; i += 2) {
            const operator = tokens[i];
            const operand = parseFloat(tokens[i + 1]);
            result = operators[operator](result, operand);
        }

        return result;
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;

            if (value === 'AC') {
                currentInput = '0';
                currentOperation = '';
                previousInput = '';
                lastOperator = '';
            } else if (value === '±') {
                currentInput = (parseFloat(currentInput) * -1).toString();
            } else if (value === '%') {
                currentInput = (parseFloat(currentInput) / 100).toString();
            } else if ('+-×÷'.includes(value)) {
                if (currentOperation === '') {
                    currentOperation = currentInput + value;
                } else if (shouldResetInput) {
                    currentOperation = currentOperation.slice(0, -1) + value;
                } else {
                    currentOperation += currentInput + value;
                }
                shouldResetInput = true;
                lastOperator = value;
            } else if (value === '=') {
                if (currentOperation && !shouldResetInput) {
                    const result = calculate(currentOperation + currentInput);
                    currentInput = result.toString();
                    currentOperation = '';
                    shouldResetInput = true;
                }
            } else if (value === '.') {
                if (!currentInput.includes('.')) {
                    currentInput += value;
                }
            } else if (value === '⌫') {
                if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = '0';
                }
            } else { // 数字按钮
                if (shouldResetInput) {
                    currentInput = value;
                    shouldResetInput = false;
                } else {
                    // 限制输入长度在10位以内（包括小数点）
                    if (currentInput.length < 10) {
                        currentInput = currentInput === '0' ? value : currentInput + value;
                    }
                }
            }

            updateDisplay();
        });
    });
});
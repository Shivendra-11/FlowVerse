import { GoogleGenAI } from "@google/genai";

export const FlowAi = async (req, res) => {
  try {
    const { messages, title, description, startCode, testCases } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages array is required",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Get the last user message
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop();

    // 🎯 SMART CODING FILTER
    if (lastUserMessage) {
      const userText = lastUserMessage.parts[0].text.toLowerCase();
      
      // Check for code context
      const hasCodeContext = startCode || description || title;
      
      // Programming keywords
      const programmingKeywords = [
        'code', 'program', 'function', 'class', 'method', 'algorithm',
        'array', 'linked', 'tree', 'graph', 'stack', 'queue', 'hash',
        'sort', 'search', 'complexity', 'optimize', 'debug', 'error',
        'compile', 'runtime', 'syntax', 'logic', 'variable', 'loop',
        'if', 'else', 'for', 'while', 'return', 'print', 'input',
        'output', 'java', 'python', 'cpp', 'javascript', 'typescript',
        'complete', 'write', 'implement', 'solve', 'fix', 'missing'
      ];
      
      // Non-coding keywords (will reject these)
      const nonCodingKeywords = [
        'weather', 'news', 'sports', 'movie', 'music', 'joke',
        'story', 'poem', 'recipe', 'travel', 'shopping', 'game',
        'personal', 'life', 'love', 'friend', 'family', 'health',
        'today', 'date', 'time', 'year', 'month', 'day',
        'history', 'politics', 'celebrity', 'food', 'drink',
        'philosophy', 'religion', 'sports', 'entertainment'
      ];
      
      const hasCodingKeyword = programmingKeywords.some(keyword => 
        userText.includes(keyword)
      );
      
      const hasNonCodingKeyword = nonCodingKeywords.some(keyword => 
        userText.includes(keyword)
      );
      
      // Check if it's a coding question
      const isShortInstruction = userText.split(' ').length <= 8;
      const hasQuestionMark = userText.includes('?');
      const isGeneralQuestion = userText.startsWith('what is') || 
                               userText.startsWith('how to') || 
                               userText.startsWith('explain');
      
      // 🚫 REJECT non-coding questions
      if ((!hasCodingKeyword && !hasCodeContext && !isShortInstruction) || 
          (hasNonCodingKeyword && !hasCodingKeyword)) {
        
        // Allow "what is [coding concept]" questions
        if (isGeneralQuestion && !hasNonCodingKeyword) {
          // Let it pass - might be "what is array"
        } else {
          return res.status(200).json({
            success: true,
            message: `🚫 **I'm a Coding & DSA Assistant**\n\nI only answer questions about:\n• **Data Structures & Algorithms** (Arrays, Trees, Graphs, etc.)\n• **Programming Concepts** (OOP, Functions, Loops, etc.)\n• **Code Completion & Debugging**\n• **Time/Space Complexity Analysis**\n\nPlease ask a coding-related question or share code you need help with!`
          });
        }
      }
    }

    // Prepare conversation history
    const formattedMessages = messages
      .filter(msg => msg.role === 'user' || msg.role === 'model' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.parts[0].text }]
      }));

    // 🚀 **ENHANCED SYSTEM PROMPT - ChatGPT-like format**
    const systemInstructionText = `
# ROLE: Expert DSA & Coding Assistant (ChatGPT-style)

## FORMATTING RULES (STRICTLY FOLLOW):
1. **Use Markdown formatting** for clean presentation
2. **Code blocks**: Always use triple backticks with language name:
   \`\`\`java
   // Java code here
   \`\`\`
3. **Structure responses** with clear sections
4. **Bold important terms** using **double asterisks**
5. **Use bullet points** for lists

## RESPONSE TEMPLATE:

### **1. Problem Analysis** (if applicable)
- Briefly explain the problem
- Mention constraints if any

### **2. Solution Approach**
- Step-by-step logic
- Algorithm choice reasoning
- Complexity considerations

### **3. Code Implementation**
\`\`\`[language]
// Complete, runnable code
// Well-commented
// Handles edge cases
\`\`\`

### **4. Explanation**
- Line-by-line breakdown for complex parts
- Key algorithms/data structures used
- Time & Space Complexity: O(n) etc.

### **5. Testing & Debugging Tips**
- Sample test cases
- Common pitfalls
- How to test/debug

## CURRENT CONTEXT:
${title ? `**Problem Title:** ${title}` : ''}
${description ? `\n**Description:**\n${description.substring(0, 400)}${description.length > 400 ? '...' : ''}` : ''}
${startCode ? `\n**Incomplete Code:**\n\`\`\`\n${startCode.substring(0, 300)}\n\`\`\`` : ''}
${testCases && testCases.length > 0 ? `\n**Test Cases:** ${testCases.length} provided` : ''}

## TASK-SPECIFIC INSTRUCTIONS:

### For Code Completion:
1. Analyze the incomplete code
2. Provide **FULL WORKING SOLUTION**
3. Keep original structure if provided
4. Add comments for added parts

### For DSA Explanations:
1. Define the concept clearly
2. Provide visual example if helpful
3. Show practical implementation
4. Discuss real-world applications

### For Debugging:
1. Identify the error type
2. Explain why it's happening
3. Provide fixed code
4. Suggest prevention tips

### For Algorithm Questions:
1. Explain the algorithm
2. Show step-by-step execution
3. Provide code implementation
4. Analyze complexity

## FORMATTING EXAMPLES:

✅ **GOOD (What I want):**
### **1. Problem Analysis**
We need to find the sum of two numbers...

### **2. Solution Approach**
Use simple addition...

### **3. Code Implementation**
\`\`\`java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}
\`\`\`

### **4. Explanation**
- Scanner reads input...
- Time Complexity: O(1)

❌ **BAD (Avoid this):**
Just write code without explanation or use plain text for code.

## IMPORTANT NOTES:
- Always use proper code formatting
- Include language name in code blocks
- Be concise but thorough
- If question is unclear, ask for clarification
- Focus ONLY on coding/DSA topics
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: formattedMessages,
    });

    return res.status(200).json({
      success: true,
      message: response.text,
    });

  } catch (err) {
    console.error("Error in FlowAi controller:", err);
    
    // Enhanced error messages
    let errorMessage = "Error generating AI response";
    if (err.message.includes("429")) {
      errorMessage = "⏳ **Rate Limit Exceeded**\n\nPlease wait a moment before trying again.";
    } else if (err.message.includes("400")) {
      errorMessage = "❌ **Invalid Request**\n\nThere was an issue with the AI service. Please try a different question.";
    } else if (err.message.includes("503")) {
      errorMessage = "🔧 **Service Temporarily Unavailable**\n\nThe AI service is currently busy. Please try again in a few moments.";
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: err.message,
    });
  }
};
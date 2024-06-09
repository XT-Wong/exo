# Define matrices
import numpy as np
import torch
Q = np.array([[2, 1, 4], [7, 6, 8]])
K = np.array([[1, 3, 3], [1, 4, 4], [3, 2, 3]])
V = np.array([[2, 4], [2, 2], [2, 3]])

# Split Q into individual heads (columns)
Q1 = Q[:, 0].reshape(-1, 1)
Q2 = Q[:, 1].reshape(-1, 1)
Q3 = Q[:, 2].reshape(-1, 1)

# Calculate QK^T for each head
QK_T1 = np.array([[2,6,6],[7,21,21]])
QK_T2 = np.array([[2,1,2],[12,6,12]])
QK_T3 = np.array([[12,16,12],[24,32,24]])
# Apply softmax
attention_scores1 = np.softmax(QK_T1)
attention_scores2 = np.softmax(QK_T2)
attention_scores3 = np.softmax(QK_T3)

# Calculate the output for each head
output1 = np.dot(attention_scores1, V)
output2 = np.dot(attention_scores2, V)
output3 = np.dot(attention_scores3, V)

# Concatenate the outputs from all heads
multi_head_output = np.concatenate([output1, output2, output3], axis=1)

print(QK_T1, QK_T2, QK_T3)
print(attention_scores1, attention_scores2, attention_scores3)
print(output1, output2, output3)
multi_head_output

#!/usr/bin/env node

/**
 * Script para testar a funcionalidade de delete de tarefas
 * Uso: node test-delete-api.js <taskId> [token]
 */

const taskId = process.argv[2];
const token = process.argv[3] || "test-token";

if (!taskId) {
  console.error("❌ Erro: taskId é obrigatório");
  console.log("Uso: node test-delete-api.js <taskId> [token]");
  process.exit(1);
}

const API_URL = "http://localhost:3000/api";

async function testDeleteTask() {
  try {
    console.log(`🧪 Testando delete de tarefa: ${taskId}`);
    console.log(`📍 URL: ${API_URL}/tasks/${taskId}`);
    console.log(`🔐 Token: ${token.substring(0, 10)}...`);

    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log(`\n📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("❌ Erro ao deletar:", error);
      process.exit(1);
    }

    if (response.status === 204) {
      console.log("✅ Tarefa deletada com sucesso! (204 No Content)");
    } else {
      const data = await response.json();
      console.log("✅ Tarefa deletada com sucesso!", data);
    }
  } catch (error) {
    console.error("❌ Erro na requisição:", error.message);
    process.exit(1);
  }
}

testDeleteTask();

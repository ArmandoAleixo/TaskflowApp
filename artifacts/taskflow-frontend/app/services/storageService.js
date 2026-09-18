// storageService.js
// Placeholder para persistência local — preparado para Fase 2 (AsyncStorage ou backend)
//
// Nesta Fase 1, os dados ficam apenas em memória (useState no TaskContext).
// Para ativar persistência, basta descomentar as funções abaixo e importar
// AsyncStorage de @react-native-async-storage/async-storage.

// import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@taskflow_tasks";

const storageService = {
  /**
   * Salva as tarefas localmente.
   * @param {Array} tasks
   * @returns {Promise<void>}
   */
  async save(tasks) {
    // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    console.log("[storageService] save() chamado — persistência desativada na Fase 1");
  },

  /**
   * Carrega as tarefas salvas localmente.
   * @returns {Promise<Array|null>}
   */
  async load() {
    // const data = await AsyncStorage.getItem(STORAGE_KEY);
    // return data ? JSON.parse(data) : null;
    console.log("[storageService] load() chamado — persistência desativada na Fase 1");
    return null;
  },

  /**
   * Remove todas as tarefas salvas.
   * @returns {Promise<void>}
   */
  async clear() {
    // await AsyncStorage.removeItem(STORAGE_KEY);
    console.log("[storageService] clear() chamado — persistência desativada na Fase 1");
  },
};

export default storageService;

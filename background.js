import { initialize as actionButtonInitialize } from './modules_bg/actionButton.js';
import { initialize as frontModuleManagerInitialize } from './modules_bg/frontModuleManager.js';

// Add other module imports here

// Initialize all modules
frontModuleManagerInitialize();
actionButtonInitialize();
// Call initialize for all other modules


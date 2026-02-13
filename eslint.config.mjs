import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "double"]
    },
    languageOptions: {
      globals: {
        // Standard Browser things
        document: "readonly",
        window: "readonly",
        location: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        navigator: "readonly",
        DOMParser: "readonly",
        URLSearchParams: "readonly",
        FileReader: "readonly",
        URL: "readonly",
        alert: "readonly",
        confirm: "readonly",
        // External Libraries you are using
        axios: "readonly",
        Swal: "readonly",
        Razorpay: "readonly",
        Cropper: "readonly",
        variantImages: "readonly",
        // Node.js things
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        console: "readonly"
      }
    }
  }
];
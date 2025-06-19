@@ .. @@
 import { Link } from "react-router-dom";
+import { APP_NAME, APP_TAGLINE } from "../constants/uiStrings";
 
+/**
+ * Footer - Application footer with copyright and links
+ * 
+ * @component
+ * @example
+ * return <Footer />
+ */
 export default function Footer() {
   const currentYear = new Date().getFullYear();
 }
 
@@ .. @@
     <footer className="bg-zen-cream/60 backdrop-blur py-4">
       <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 sm:flex-row sm:justify-between">
         <p className="font-medium">
-          © {currentYear} Zensai • Journaling, but with a heart.
+          © {currentYear} {APP_NAME} • {APP_TAGLINE}
         </p>
 
         <nav className="flex gap-6 flex-wrap justify-center">
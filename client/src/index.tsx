import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./components/redux/store"
import App from "./routes/Main"
import reportWebVitals from "./reportWebVitals"
import "./index.css"
import SaveChanges from "./components/modals/saveChanges"
import { SnackbarProvider } from "notistack"

const container = document.getElementById("root")!

const root = createRoot(container)
declare module "notistack" {
  interface VariantOverrides {
    saveChanges: {
      onSave: (finalObject: any) => any
      onReset: (initialObject: any) => any
      initialObject: any
      finalObject: any
    }
  }
}

root.render(
  <Provider store={store}>
    <SnackbarProvider
      Components={{
        saveChanges: SaveChanges,
      }}
      domRoot={
        ((document.getElementById("notistack") || null) as HTMLElement) || null
      }
      maxSnack={1}
    >
      <App />
    </SnackbarProvider>
  </Provider>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()


import {
  HashRouter,
  Navigate,
  Route,
  Routes,
} from "react-router";

import "./App.css";

import Layout from "./app/layout/layout";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Inmates from "./pages/inmates";
import ManageInmate from "./pages/inmates/manage-inmate";
import ViewInmate from "./pages/inmates/view-inmate";
import Visitors from "./pages/visitors";
import ManageVisit from "./pages/visitors/manage-visit";
import Cells from "./pages/cells";
import ManageCell from "./pages/cells/manage-cell";
import Crimes from "./pages/crimes";
import ManageCrime from "./pages/crimes/manage-crime";
import Prisons from "./pages/prisons";
import Users from "./pages/users";

function App() {
  return (
    <HashRouter>
      <Routes>

        {/* =========================
            AUTH
        ========================== */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* =========================
            APPLICATION
        ========================== */}

        <Route element={<Layout />}>

          <Route path="/dashboard" element={<Dashboard />} />
          {/* ROUTES DETENUES */}
          <Route path="/inmates" element={<Inmates />} />
          <Route path="/inmates/new" element={<ManageInmate />}/>
          <Route path="/inmates/:id/edit" element={<ManageInmate />}/>
          <Route path="/inmates/:id" element={<ViewInmate />}/>

          {/* ROUTES VISITEURS */}
          <Route path="/visits" element={<Visitors />} />
          <Route path="/visits/new" element={<ManageVisit />}/>
          <Route path="/visits/:id/edit" element={<ManageVisit />}/>

          {/* CELLS ROUTES */}
          <Route path="/cells" element={<Cells />} />
          <Route path="/cells/new" element={<ManageCell />} />
          {/* <Route path="/cells/:id" element={<CellDetails />} />
          <Route path="/cells/:id/edit" element={<ManageCell />} /> */}

          {/* CRIMES ROUTES */}
          <Route path="/crimes" element={<Crimes />} />
          <Route path="/crimes/new" element={<ManageCrime />}/>
          <Route path="/crimes/:id/edit" element={<ManageCrime />}/>
          {/* <Route path="/crimes/:id" element={<CrimeDetails />}/> */}

          {/* PRISONS ROUTES */}
          <Route path="/prisons" element={<Prisons />} />
          <Route path="/crimes/new" element={<ManageCrime />}/>
          <Route path="/crimes/:id/edit" element={<ManageCrime />}/>
          {/* <Route path="/crimes/:id" element={<CrimeDetails />}/> */}
          
          {/* USER ROUTES */}
          <Route path="/users" element={<Users />} />
          <Route path="/crimes/new" element={<ManageCrime />}/>
          <Route path="/crimes/:id/edit" element={<ManageCrime />}/>

        </Route>

        {/* =========================
            FALLBACK
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </HashRouter>
  );
}

export default App;
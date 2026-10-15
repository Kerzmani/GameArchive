import axios from "axios";
import { useMemo, useState, useEffect } from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";

// const games = [
//   {
//     name: "Elden Ring",
//     studio: "FromSoftware",
//     year: 2022,
//     genre: "Action RPG",
//     rating: 4.9,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuDlC1EGepB-312zihPX92kZ9YVV8BpxYcre0tUT7lNQgATTAMxPyItszz7L4MHWGSS8WANgyVSuvLMQZ5zuuTM6cR4b5OlFC4tG_Ik0UFo-IJ3_Fne5dhISp37Z1DSv6B_yh2fACO1x84IxoLC-qhVilt60xtZcgyKnwvuQXiiI9pBReDINNXqB6tCR-LCwplcTmByWlG8IdyUW1-rAamK97C8rN1J8jvZqU7gyr3ZPdZ_6lSf9-iox"
//   },
//   {
//     name: "Baldur's Gate 3",
//     studio: "Larian Studios",
//     year: 2023,
//     genre: "CRPG",
//     rating: 4.9,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuBu2JKcWyH9ouBbUirFgxt0qEwsG-u3uzRgQaAxcswuVjcfBAG2qhQ7VMpgv0_eI4ZUz4czbMhRybsmR3YHXzai2TTmblxwlWwQznGRhdnthdrz_gRA2Aedq410mnDW9F45EWtCI6N-i0URXBSV9SP38no0l1x3vTkvKQSN_IicoibTWiGrDrvZmcxpKzR06PdMg6OrLHFt8Z6WQxRc-muGA_9-mD7ksf4GeEM8mluhr6A2hm49CWuo"
//   },
//   {
//     name: "Alan Wake 2",
//     studio: "Remedy",
//     year: 2023,
//     genre: "Survival Horror",
//     rating: 4.7,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuCGpemcwlUW93QaRXlxSmYwZe7D5B2ykG5VTT0kw8jNDKM58YE0G7isoIWYbifXdbTkUpMPyii8yekaYZJ5bhAmc1vcsUI337yF-dFW4NfZH-0rqBtGFVcyCBUp4CVLXaAOsmjhXQM0UuGocJNrFle7SL3UJbNOv0xN43KTTQ8ahVHq8w57QIzSpEpaOXvwMJbn8MmRqZLjhU0Ih_d0TmmNRgCt7DtjzaBP1HZLWoJO6HgXSH0Gy0xI"
//   },
//   {
//     name: "Phantom Liberty",
//     studio: "CD Projekt RED",
//     year: 2023,
//     genre: "Sci-Fi RPG",
//     rating: 4.8,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuBo3baNjKoMQBasUDNGD7izC42OEWu-Y-EsMyA8yaLOMtR63L4NL4Z55sQDkq5a0_ozgTfPp0SxQwm37snkYe_DOejLHqCDKSyC65Czxphu21N3MJYpn_NjCGBxGregrFB83pqLqwBswIWfUaUxk7LyS83cpP8qunP6FRrb706C8eUKcpb1F7PBW4OvwG4eGQVhwu7J_7MOU2SUS3s4e-JXFr3J1rJHS1D_Jjon6U9w3H-Ryd4BTW6u"
//   },
//   {
//     name: "Hollow Knight",
//     studio: "Team Cherry",
//     year: 2017,
//     genre: "Metroidvania",
//     rating: 4.8,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuCNbhVBAeH0-vRFlZDCls7TvgPV4qmXVdzI2e3fvDGMRo3d5WUaPv9baDdHASdzfKAkxFletZKXb8ZGXGwccRta_p50NUmf5D2046DSiEq_hEK3QjTK50ACuDJydt9sM_AblpAQftmAWC7DVZ5CWKQNLb4uZTXxcmSzqXDpJSZogZWUOR3yti7fNx0djrm_o98G8kTa-_uQEHQTO6tR5llM6FnACbOC65P2ClDkB0pBo-0I878A1YGX"
//   },
//   {
//     name: "Persona 5 Royal",
//     studio: "ATLUS",
//     year: 2020,
//     genre: "JRPG",
//     rating: 4.8,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuB68s3Oik4Kqh2avA-9GnuDqx8xzxTsWnxq6fvevxOSdQofJbMif4QM9ScWCkz9U8NdR_x6VqW8VmWq1rrNjJsTKIS9nvGYc_FKpiYJTuhet7HpL8k4e6UJk8OP5bDOiXqYqXvSoj2Iq4Chzx_RXZzzFtu7dYtFhdA5myh8xbmuHkEvY0IFu3R74q0B661exZU3sSVUx5uSK_sccXvZ2oAMyTEptnbPiTa9Mh9cP1SB3SZ6j1t8PYdZ"
//   }
// ];

function App() {
  return (
    <Home />
  )
}

export default App;

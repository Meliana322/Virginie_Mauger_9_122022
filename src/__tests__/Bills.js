/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { toHaveClass } from "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/Store", () => mockStore);


//Scénario 1
describe("Given I am connected as an employee", () => {
  //Étant donné que je suis connecté en tant qu'employé

  //Scénario 1.1
	describe("When I am on Bills Page", () => {
    //Quand je suis sur la page Factures
		test("Then bill icon in vertical layout should be highlighted", async () => {
      //Ensuite, l'icône de la facture dans la disposition verticale doit être mise en surbrillance
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				}),
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");

			//J'attends que la classe soit
			expect(windowIcon).toHaveClass("active-icon");
		});
		test("Then bills should be ordered from earliest to latest", () => {
      //Ensuite, les factures doivent être commandées du plus ancien au plus tard
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen
				.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);

      //J'attends que ce soit égal
			expect(dates).toEqual(datesSorted);
		});
	});

  //Scénario 1.2
	describe("When I am on bill page but it is loading", () => {
    //Quand je suis sur la page de facturation mais qu'elle est en cours de chargement
		test("Then, Loading page should be rendered", () => {
      //Ensuite, la page de chargement devrait être rendue
			document.body.innerHTML = BillsUI({ loading: true });

      //J'attends que ce soit vrai
			expect(screen.getAllByText("Loading...")).toBeTruthy();
		});
	});

  //Scénario 1.3
	describe("When I am on bill page but back-end send an error message", () => {
    //Lorsque je suis sur la page de facturation mais que le back-end envoie un message d'erreur
		test("Then, Error page should be rendered", () => {
      //Ensuite, la page d'erreur doit être rendue
			document.body.innerHTML = BillsUI({ error: "some error message" });

      //J'attends que ce soit vrai
			expect(screen.getAllByText("Erreur")).toBeTruthy();
		});
	});

  //Scénario 1.4
	describe("When I am on Bills Page and I click on the icon eye", () => {
    //Quand je suis sur la page Factures et que je clique sur l'icône oeil
		test("then a modal should open", () => {
      //alors une modale devrait s'ouvrir
			const modal = ($.fn.modal = jest.fn());

			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				}),
			);
			document.body.innerHTML = BillsUI({ data: bills });
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

			const store = null;
			const eye = screen.getAllByTestId("icon-eye")[0];

			const handleClickIconEye = jest.fn(
				new Bills({
					document,
					onNavigate,
					store,
					localStorage: window.localStorage,
				}).handleClickIconEye(eye),
			);

			eye.addEventListener("click", handleClickIconEye);
			userEvent.click(eye);

			expect(handleClickIconEye).toHaveBeenCalled();

			const modalcontainer = document.getElementById("modaleFile");

      //J'attends que ce soit vrai
			expect(modalcontainer).toBeTruthy();

      //J'attends que la fonction fictive soit appelée
			expect(modal).toHaveBeenCalled();
		});
	});

  //Scénario 1.5
	describe("When I am on Bills Page and I click on the new bill button", () => {
    //Lorsque je suis sur la page Factures et que je clique sur le bouton nouvelle facture
		test("NewBill page should render", () => {
      //La page NewBill devrait s'afficher
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				}),
			);
			document.body.innerHTML = BillsUI({ data: bills });
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const btnNewBill = screen.getByTestId("btn-new-bill");

			const handleClickIconEye = jest.fn(
				new Bills({
					document,
					onNavigate,
					store,
					localStorage: window.localStorage,
				}).handleClickNewBill(),
			);

			btnNewBill.addEventListener("click", handleClickIconEye);
			userEvent.click(btnNewBill);

      //J'attends que la fonction fictive soit appelée
			expect(handleClickIconEye).toHaveBeenCalled();

			const pageNewBill = screen.getByTestId("form-new-bill");

      //J'attends que ce soit vrai
			expect(pageNewBill).toBeTruthy();
		});
	});
});

//Scénario 2 (test d'intégration GET)
describe("Given I am a user connected as Employee", () => {
  //Etant donné que je suis un utilisateur connecté en tant que Salarié

  //Scénario 2.1
	describe("When I navigate to Bills Page", () => {
    //Lorsque j'accède à la page Factures
		test("fetches bills from mock API GET", async () => {
      //récupère les factures de l'API simulée GET
			localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("tbody"));
			const bills = screen.getByTestId("tbody");

      //J'attends que ce soit vrai
			expect(bills).toBeTruthy();

      //J'attends que ce soit égal
			expect(bills.childElementCount).toEqual(4);
		});


    //Scénario 2.1.1
		describe("When an error occurs on API", () => {
      //Lorsqu'une erreur se produit sur l'API
			beforeEach(() => {
				jest.spyOn(mockStore, "bills");
				Object.defineProperty(window, "localStorage", { value: localStorageMock });
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
						email: "a@a",
					}),
				);
				const root = document.createElement("div");
				root.setAttribute("id", "root");
				document.body.appendChild(root);
				router();
			});
			test("fetches bills from an API and fails with 404 message error", async () => {
        //récupère les factures d'une API et échoue avec une erreur de message 404
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 404"));
						},
					};
				});
				window.onNavigate(ROUTES_PATH.Bills);
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 404/);

        //J'attends que ce soit vrai
				expect(message).toBeTruthy();
			});

			test("fetches messages from an API and fails with 500 message error", async () => {
        //récupère les messages d'une API et échoue avec une erreur de message 500
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 500"));
						},
					};
				});

				window.onNavigate(ROUTES_PATH.Bills);
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 500/);

        //J'attends que ce soit vrai
				expect(message).toBeTruthy();
			});
		});
	});
});

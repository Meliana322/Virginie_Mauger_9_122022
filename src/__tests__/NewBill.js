/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { fireEvent } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  //Étant donné que je suis connecté en tant qu'employé
	describe("When I am on NewBill Page", () => {
    //Quand je suis sur la page NewBill
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
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId("icon-mail"));
			const emailIcon = screen.getByTestId("icon-mail");
			expect(emailIcon).toHaveClass("active-icon");
		});
	});
	describe("When I am on NewBill Page and I select a image", () => {
    //Quand je suis sur NewBill Page et que je sélectionne une image
		test("Then the image is uploaded if the right extention is choose", () => {
      //Alors l'image est téléchargée si la bonne extension est choisie
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				}),
			);

			const html = NewBillUI();
			document.body.innerHTML = html;
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const handleChangeFile = jest.fn((e) =>
				new NewBill({
					document,
					onNavigate,
					store: null,
					localStorage: window.localStorage,
				}).handleChangeFile(e),
			);
			const uploadFile = screen.getByTestId("file");

			uploadFile.addEventListener("change", handleChangeFile);

			fireEvent.change(uploadFile, {
				target: { files: [new File(["image"], "image.png", { type: "image/png" })] },
			});

			expect(handleChangeFile).toHaveBeenCalled();
			expect(uploadFile.files[0].type).toBe("image/png");
		});

    test("Then if I upload a file with wrong extention , a alert appear and the file is not uploaded ", () => {
      //Ensuite, si je télécharge un fichier avec une mauvaise extension, une alerte apparaît et le fichier n'est pas téléchargé
			jest.spyOn(window, "alert").mockImplementation(() => {});

			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				}),
			);
			const html = NewBillUI();
			document.body.innerHTML = html;
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const handleChangeFile = jest.fn((e) =>
				new NewBill({
					document,
					onNavigate,
					store: null,
					localStorage: window.localStorage,
				}).handleChangeFile(e),
			);
			const uploadFile = screen.getByTestId("file");
			uploadFile.addEventListener("change", handleChangeFile);

			fireEvent.change(uploadFile, {
				target: {
					files: [new File(["image"], "fichier.pdf", { type: "application/pdf" })],
				},
			});

			expect(handleChangeFile).toHaveBeenCalled();
			expect(window.alert).toBeCalled();
		});
	});

//////
describe("When I am on NewBill Page and I completed all required fields", () => {
	//Lorsque je suis sur la page NewBill et que j'ai rempli tous les champs obligatoires
	test("Then I can submit the form", async () => {
		//Alors je peux soumettre le formulaire
		const html = NewBillUI({});
		document.body.innerHTML = html;
		const onNavigate = (pathname) => {
			document.body.innerHTML = ROUTES({ pathname });
		};
		Object.defineProperty(window, "localStorage", { value: localStorageMock });
		window.localStorage.setItem(
			"user",
			JSON.stringify({
				email: "azerty@email.com",
			}),
		);
		const store = null;
		const newBill = new NewBill({
			document,
			onNavigate,
			store,
			localStorage: window.localStorage,
		});

		const bill = {
			type: "Transport",
			name: "Vol Paris Londres",
			amount: "300",
			date: "2022-08-03",
			vat: "20",
			pct: "10",
		};

		const uploadFile = screen.getByTestId("file");

		fireEvent.change(uploadFile, {
			target: { files: [new File(["image.png"], "image.png", { type: "image/png" })] },
		});

		screen.getByTestId("datepicker").value = bill.date;
		screen.getByTestId("expense-name").value = bill.name;
		screen.getByTestId("expense-type").value = bill.type;
		screen.getByTestId("amount").value = bill.amount;
		screen.getByTestId("vat").value = bill.vat;
		screen.getByTestId("pct").value = bill.pct;

		const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

		newBill.updateBill = jest.fn();

		const form = screen.getByTestId("form-new-bill");
		form.addEventListener("submit", handleSubmit);
		fireEvent.submit(form);
		expect(handleSubmit).toHaveBeenCalled();
		await waitFor(() => screen.getByText("Mes notes de frais"));
		const bills = screen.getByText("Mes notes de frais");
		expect(bills).toBeTruthy();
	});
});

})

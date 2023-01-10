/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { fireEvent } from "@testing-library/dom";



import { fireEvent, screen, waitFor } from "@testing-library/dom";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
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
		test("then the image is uploaded if the right extention is choose", () => {
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

		test("then if I upload a file with wrong extention , a alert appear and the file is not uploaded ", () => {
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
})

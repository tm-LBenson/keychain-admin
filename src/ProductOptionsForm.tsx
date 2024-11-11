import React, { useEffect, useState } from "react";
import { db } from "./firestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export interface ProductOption {
  name: string;
  choices: string[];
}

const ProductOptionsForm: React.FC<{
  productId: string;
  initialOptions?: ProductOption[];
  onUnsavedChanges: (unsaved: boolean) => void;
}> = ({ productId, initialOptions = [], onUnsavedChanges }) => {
  const [options, setOptions] = useState<ProductOption[]>(initialOptions);
  const [newOptionName, setNewOptionName] = useState<string>("");
  const [newChoice, setNewChoice] = useState<string>("");
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null,
  );
  const [editingChoiceIndex, setEditingChoiceIndex] = useState<number | null>(
    null,
  );
  const [editedChoice, setEditedChoice] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isCreatingOption, setIsCreatingOption] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);

  // Load initial product options from Firestore when productId changes
  useEffect(() => {
    const loadProductOptions = async () => {
      if (!productId) return;

      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          if (productData?.options) {
            setOptions(productData.options);
          }
        }
      } catch (error) {
        console.error("Error loading product options:", error);
      }
    };

    loadProductOptions();
  }, [productId]);

  const handleCreateOption = () => {
    setIsCreatingOption(true);
    onUnsavedChanges(true);
  };

  const handleSaveNewOption = () => {
    if (newOptionName.trim() !== "") {
      setOptions((prevOptions) => [
        ...prevOptions,
        { name: newOptionName, choices: [] },
      ]);
      setNewOptionName("");
      setIsCreatingOption(false);
      setHasUnsavedChanges(true);
      onUnsavedChanges(true);
    }
  };

  const handleAddChoice = (optionIndex: number) => {
    if (newChoice.trim() === "") return;
    setOptions((prevOptions) => {
      const updatedOptions = prevOptions.map((option, i) =>
        i === optionIndex
          ? { ...option, choices: [...option.choices, newChoice] }
          : option,
      );
      return updatedOptions;
    });
    setNewChoice("");
    setHasUnsavedChanges(true);
    onUnsavedChanges(true);
  };

  const handleEditChoice = (optionIndex: number, choiceIndex: number) => {
    setEditingChoiceIndex(choiceIndex);
    setEditedChoice(options[optionIndex].choices[choiceIndex]);
    setEditingOptionIndex(optionIndex);
  };

  const handleSaveEditedChoice = async (
    optionIndex: number,
    choiceIndex: number,
  ) => {
    setOptions((prevOptions) => {
      const updatedOptions = prevOptions.map((option, i) => {
        if (i === optionIndex) {
          let updatedChoices = [...option.choices];
          if (editedChoice.trim() === "") {
            // Remove the choice if the edited name is empty
            updatedChoices = updatedChoices.filter((_, j) => j !== choiceIndex);
          } else {
            updatedChoices[choiceIndex] = editedChoice;
          }
          return { ...option, choices: updatedChoices };
        }
        return option;
      });
      return updatedOptions;
    });

    try {
      if (productId) {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
          options: JSON.parse(JSON.stringify(options)),
        });
        console.log("Options saved to Firestore.");
      } else {
        console.error("Product ID is not defined. Cannot save to Firestore.");
      }
    } catch (error) {
      console.error("Error saving options to Firestore: ", error);
    }

    // Reset the editing state
    setEditingChoiceIndex(null);
    setEditingOptionIndex(null);
    setEditedChoice("");
    setHasUnsavedChanges(true);
    onUnsavedChanges(true);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
    if (editingOptionIndex === index) {
      setEditingOptionIndex(null);
    }
    setHasUnsavedChanges(true);
    onUnsavedChanges(true);
  };

  const handleSaveOptions = async () => {
    if (!productId) {
      console.error("Product ID is undefined. Cannot save options.");
      return;
    }

    try {
      const productRef = doc(db, "products", productId);
      const optionsToSave = JSON.parse(JSON.stringify(options));
      console.log("Saving options:", optionsToSave);

      await updateDoc(productRef, {
        options: optionsToSave,
      });
      setHasUnsavedChanges(false);
      onUnsavedChanges(false);
      console.log("Options saved successfully.");
    } catch (error) {
      console.error("Error saving options: ", error);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold mb-4">Product Options</h2>
      <button
        onClick={handleCreateOption}
        className="p-2 rounded mr-5 bg-blue-500 text-white mb-4"
      >
        Create Option
      </button>
      {isCreatingOption && (
        <div className="mb-4">
          <input
            type="text"
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            placeholder="Option Name (e.g., Size, Color)"
            className="block w-full mb-2 p-2 border rounded"
          />
          <button
            onClick={handleSaveNewOption}
            className="p-2 rounded bg-green-500 text-white"
          >
            Save Option
          </button>
        </div>
      )}
      {options.map((option, optionIndex) => (
        <div
          key={optionIndex}
          className="mb-4 flex flex-col mr-5"
        >
          <label className="block font-bold mb-2">{option.name}</label>
          <div className="relative">
            <div
              className="block w-full p-2 border rounded mb-2 cursor-pointer"
              onClick={() =>
                setIsDropdownOpen((prev) =>
                  prev === optionIndex ? null : optionIndex,
                )
              }
            >
              {isDropdownOpen === optionIndex ? (
                <span className="font-bold bg-green-500 text-white p-2 rounded ">
                  Close Choices
                </span>
              ) : (
                "Select or Add a Choice"
              )}
            </div>

            {isDropdownOpen === optionIndex && (
              <ul className="absolute left-0 top-full mt-2 p-2 bg-white border rounded shadow-md w-full z-10">
                {option.choices.map((choice, choiceIndex) => (
                  <li
                    key={choiceIndex}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleEditChoice(optionIndex, choiceIndex)}
                  >
                    {editingChoiceIndex === choiceIndex &&
                    editingOptionIndex === optionIndex ? (
                      <div>
                        <input
                          type="text"
                          value={editedChoice}
                          onChange={(e) => setEditedChoice(e.target.value)}
                          className="flex-1 p-2 border rounded mb-2 w-full"
                        />
                        <button
                          onClick={() =>
                            handleSaveEditedChoice(optionIndex, choiceIndex)
                          }
                          className="p-2 rounded bg-green-500 text-white w-full"
                        >
                          Save Edited Choice
                        </button>
                      </div>
                    ) : (
                      choice
                    )}
                  </li>
                ))}
                <li className="mt-2">
                  <label>
                    Add New Choice
                    <input
                      type="text"
                      value={newChoice}
                      onChange={(e) => setNewChoice(e.target.value)}
                      placeholder="New Choice"
                      className="flex-1 p-2 border rounded mb-2 w-full"
                    />
                  </label>
                  <button
                    onClick={() => handleAddChoice(optionIndex)}
                    className="p-2 rounded bg-green-500 text-white w-full"
                  >
                    Add Choice
                  </button>
                </li>
              </ul>
            )}
          </div>
          <button
            onClick={() => handleRemoveOption(optionIndex)}
            className="p-2 rounded self-end bg-red-500 text-white mt-2"
          >
            Remove {option.name} Option
          </button>
        </div>
      ))}
      {hasUnsavedChanges && (
        <button
          onClick={handleSaveOptions}
          className="p-2 rounded mr-5 bg-blue-700 text-white"
        >
          Save All Options
        </button>
      )}
    </div>
  );
};

export default ProductOptionsForm;

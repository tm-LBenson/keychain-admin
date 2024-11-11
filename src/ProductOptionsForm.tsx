import React, { useState } from "react";
import { db } from "./firestore";
import { doc, updateDoc } from "firebase/firestore";

export interface ProductOption {
  name: string;
  choices: string[];
}

const ProductOptionsForm: React.FC<{ productId: string }> = ({ productId }) => {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [newOptionName, setNewOptionName] = useState<string>("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [newChoice, setNewChoice] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isCreatingOption, setIsCreatingOption] = useState<boolean>(false);

  const handleCreateOption = () => {
    setIsCreatingOption(true);
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
    }
  };

  const handleAddChoice = (index: number) => {
    if (newChoice.trim() === "") return;
    setOptions((prevOptions) => {
      const updatedOptions = prevOptions.map((option, i) =>
        i === index
          ? { ...option, choices: [...option.choices, newChoice] }
          : option,
      );
      return updatedOptions;
    });
    setNewChoice("");
    setHasUnsavedChanges(true);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
    if (selectedOptionIndex === index) {
      setSelectedOptionIndex(null);
    }
    setHasUnsavedChanges(true);
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
      console.log("Options saved successfully.");
    } catch (error) {
      console.error("Error saving options: ", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Product Options</h2>
      <button
        onClick={handleCreateOption}
        className="p-2 rounded bg-blue-500 text-white mb-4"
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
      {options.map((option, index) => (
        <div
          key={index}
          className="mb-4"
        >
          <label className="block font-bold mb-2">{option.name}</label>
          <select
            className="block w-full p-2 border rounded mb-2"
            value=""
            onChange={(e) => {
              if (e.target.value === "add-new") {
                setSelectedOptionIndex(index);
              }
            }}
          >
            <option
              value=""
              disabled
            >
              Select or add a choice
            </option>
            {option.choices.map((choice, choiceIndex) => (
              <option
                key={choiceIndex}
                value={choice}
              >
                {choice}
              </option>
            ))}
            <option value="add-new">+ Add new choice</option>
          </select>
          {selectedOptionIndex === index && (
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                placeholder="New Choice"
                className="flex-1 p-2 border rounded mr-2"
              />
              <button
                onClick={() => handleAddChoice(index)}
                className="p-2 rounded bg-green-500 text-white"
              >
                Save Choice
              </button>
            </div>
          )}
          <button
            onClick={() => handleRemoveOption(index)}
            className="p-2 rounded bg-red-500 text-white"
          >
            Remove Option
          </button>
        </div>
      ))}
      {hasUnsavedChanges && (
        <button
          onClick={handleSaveOptions}
          className="p-2 rounded bg-blue-700 text-white"
        >
          Save All Options
        </button>
      )}
    </div>
  );
};

export default ProductOptionsForm;

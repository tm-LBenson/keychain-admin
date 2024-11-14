// ProductOptionsForm.tsx
import React, { useEffect, useState } from "react";
import { ProductOption } from "./ProductsContext";

interface ProductOptionsFormProps {
  initialOptions: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
  onUnsavedChanges: (unsaved: boolean) => void;
  onEditingOptionsChange: (isEditing: boolean) => void;
}

const ProductOptionsForm: React.FC<ProductOptionsFormProps> = ({
  initialOptions,
  onOptionsChange,
  onUnsavedChanges,
  onEditingOptionsChange,
}) => {
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
  const [expandedOptionIndex, setExpandedOptionIndex] = useState<number | null>(
    null,
  );

  // Update options when initialOptions change
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  // Function to handle creating a new option
  const handleCreateOption = () => {
    setIsCreatingOption(true);
    setHasUnsavedChanges(true);
    onUnsavedChanges(true);
    onEditingOptionsChange(true);
  };

  // Function to save the new option
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
      onEditingOptionsChange(false);
    }
  };

  // Function to cancel creating a new option
  const handleCancelNewOption = () => {
    setNewOptionName("");
    setIsCreatingOption(false);
    if (!hasUnsavedChanges) {
      onUnsavedChanges(false);
    }
    onEditingOptionsChange(false);
  };

  // Function to add a new choice to an option
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

  // Function to start editing a choice
  const handleEditChoice = (optionIndex: number, choiceIndex: number) => {
    setEditingChoiceIndex(choiceIndex);
    setEditedChoice(options[optionIndex].choices[choiceIndex]);
    setEditingOptionIndex(optionIndex);
    onEditingOptionsChange(true);
  };

  // Function to save the edited choice
  const handleSaveEditedChoice = (optionIndex: number, choiceIndex: number) => {
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

    // Reset the editing state
    setEditingChoiceIndex(null);
    setEditingOptionIndex(null);
    setEditedChoice("");
    setHasUnsavedChanges(true);
    onUnsavedChanges(true);
    onEditingOptionsChange(false);
  };

  // Function to cancel editing a choice
  const handleCancelEditChoice = () => {
    setEditingChoiceIndex(null);
    setEditingOptionIndex(null);
    setEditedChoice("");
    onEditingOptionsChange(false);
  };

  // Function to remove an option
  const handleRemoveOption = (index: number) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
    if (editingOptionIndex === index) {
      setEditingOptionIndex(null);
      setEditingChoiceIndex(null);
    }
    setHasUnsavedChanges(true);
    onUnsavedChanges(true);
  };

  // Function to save all options (pass to parent)
  const handleSaveOptions = () => {
    onOptionsChange(options);
    setHasUnsavedChanges(false);
    onUnsavedChanges(false);
  };

  // Function to cancel all unsaved changes
  const handleCancelChanges = () => {
    setOptions(initialOptions);
    setHasUnsavedChanges(false);
    onUnsavedChanges(false);
    setIsCreatingOption(false);
    setNewOptionName("");
    setNewChoice("");
    setEditingChoiceIndex(null);
    setEditingOptionIndex(null);
    setEditedChoice("");
    onEditingOptionsChange(false);
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold mb-4">Product Options</h2>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleCreateOption}
          className="p-2 rounded bg-blue-500 text-white"
        >
          Create Option
        </button>
        {hasUnsavedChanges && (
          <>
            <button
              onClick={handleSaveOptions}
              className="p-2 rounded bg-green-500 text-white"
            >
              Save Options
            </button>
            <button
              onClick={handleCancelChanges}
              className="p-2 rounded bg-gray-500 text-white"
            >
              Cancel Changes
            </button>
          </>
        )}
      </div>
      {isCreatingOption && (
        <div className="mb-4 border p-4 rounded bg-gray-100">
          <input
            type="text"
            value={newOptionName}
            onChange={(e) => setNewOptionName(e.target.value)}
            placeholder="Option Name (e.g., Size, Color)"
            className="block w-full mb-2 p-2 border rounded"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveNewOption}
              className="p-2 rounded bg-green-500 text-white"
            >
              Save Option
            </button>
            <button
              onClick={handleCancelNewOption}
              className="p-2 rounded bg-red-500 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {options.map((option, optionIndex) => (
        <div
          key={optionIndex}
          className="mb-4 border p-4 rounded"
        >
          <div className="flex justify-between items-center">
            <label className="block font-bold">{option.name}</label>
            <button
              onClick={() => handleRemoveOption(optionIndex)}
              className="p-1 rounded bg-red-500 text-white"
            >
              Remove Option
            </button>
          </div>
          <div className="mt-2">
            <button
              onClick={() =>
                setExpandedOptionIndex(
                  expandedOptionIndex === optionIndex ? null : optionIndex,
                )
              }
              className="p-2 rounded bg-blue-500 text-white"
            >
              {expandedOptionIndex === optionIndex
                ? "Hide Choices"
                : "Show Choices"}
            </button>
          </div>
          {expandedOptionIndex === optionIndex && (
            <div className="mt-2">
              {option.choices.map((choice, choiceIndex) => (
                <div
                  key={choiceIndex}
                  className="flex items-center mb-2"
                >
                  {editingOptionIndex === optionIndex &&
                  editingChoiceIndex === choiceIndex ? (
                    <>
                      <input
                        type="text"
                        value={editedChoice}
                        onChange={(e) => setEditedChoice(e.target.value)}
                        className="flex-1 p-2 border rounded mr-2"
                      />
                      <button
                        onClick={() =>
                          handleSaveEditedChoice(optionIndex, choiceIndex)
                        }
                        className="p-2 rounded bg-green-500 text-white mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditChoice}
                        className="p-2 rounded bg-gray-500 text-white"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{choice}</span>
                      <button
                        onClick={() =>
                          handleEditChoice(optionIndex, choiceIndex)
                        }
                        className="p-1 rounded bg-blue-500 text-white mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          // Remove the choice
                          setOptions((prevOptions) => {
                            const updatedOptions = prevOptions.map((opt, i) => {
                              if (i === optionIndex) {
                                const updatedChoices = opt.choices.filter(
                                  (_, j) => j !== choiceIndex,
                                );
                                return { ...opt, choices: updatedChoices };
                              }
                              return opt;
                            });
                            return updatedOptions;
                          });
                          setHasUnsavedChanges(true);
                          onUnsavedChanges(true);
                        }}
                        className="p-1 rounded bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  value={newChoice}
                  onChange={(e) => setNewChoice(e.target.value)}
                  placeholder="New Choice"
                  className="flex-1 p-2 border rounded mr-2"
                />
                <button
                  onClick={() => handleAddChoice(optionIndex)}
                  className="p-2 rounded bg-green-500 text-white"
                >
                  Add Choice
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductOptionsForm;

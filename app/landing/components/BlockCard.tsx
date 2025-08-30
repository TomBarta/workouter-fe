import { StepCard } from "./StepCard";
import { Step, Block } from "./types";
import { createDefaultStep } from "./utils";

interface BlockCardProps {
    block: Block;
    onUpdate: (block: Block) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export const BlockCard = ({
    block,
    onUpdate,
    onRemove,
    canRemove
}: BlockCardProps): JSX.Element => {
    const updateBlock = (updates: Partial<Block>) => {
        onUpdate({ ...block, ...updates });
    };

    const addStepToBlock = () => {
        const newStep = createDefaultStep();
        updateBlock({ steps: [...block.steps, newStep] });
    };

    const updateStep = (stepId: string, updates: Partial<Step>) => {
        const updatedSteps = block.steps.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
        );
        updateBlock({ steps: updatedSteps });
    };

    const removeStep = (stepId: string) => {
        if (block.steps.length > 1) {
            const updatedSteps = block.steps.filter(step => step.id !== stepId);
            updateBlock({ steps: updatedSteps });
        }
    };

    return (
        <div className="card-workout border-wktr-orange-200">
            <div className="card-body">
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="btn btn-ghost btn-sm text-error-500 hover:text-error-600 hover:bg-error-50 transition-colors duration-200"
                    >
                        Remove
                    </button>
                )}

                {/* Steps */}
                <div className="space-y-4">
                    {block.steps.map((step) => (
                        <div key={step.id}>
                            <StepCard
                                step={step}
                                onUpdate={(updatedStep) => updateStep(step.id, updatedStep)}
                                onRemove={() => removeStep(step.id)}
                                canRemove={block.steps.length > 1}
                            />
                        </div>
                    ))}
                    <div className="flex justify-end items-center">
                        <button
                            type="button"
                            onClick={addStepToBlock}
                            className="btn btn-sm bg-wktr-orange-500 hover:bg-wktr-orange-600 text-white border-0 transition-colors duration-200"
                        >
                            Add Step
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

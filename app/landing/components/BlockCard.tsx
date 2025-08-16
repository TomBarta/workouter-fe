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
        <div className="card-workout border-workouter-orange-200">
            <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="card-title text-xl text-workouter-orange-600 font-bold">
                        Block {block.type === 'work' ? 'Work' : 'Recovery'}
                    </h3>
                    {canRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="btn btn-ghost btn-sm text-error-500 hover:text-error-600 hover:bg-error-50 transition-colors duration-200"
                        >
                            Remove
                        </button>
                    )}
                </div>

                {/* Block type selector */}
                <div className="form-control mb-4">
                    <div className="flex gap-4">
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={block.type === 'work'}
                                onChange={() => updateBlock({ type: 'work' })}
                                className="radio radio-primary border-workouter-gray-300 checked:border-workouter-orange-500 checked:bg-workouter-orange-500"
                            />
                            <span className="label-text text-workouter-black-600">Work</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={block.type === 'recovery'}
                                onChange={() => updateBlock({ type: 'recovery' })}
                                className="radio radio-primary border-workouter-gray-300 checked:border-workouter-orange-500 checked:bg-workouter-orange-500"
                            />
                            <span className="label-text text-workouter-black-600">Recovery</span>
                        </label>
                    </div>
                </div>

                {/* Iterations input */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-medium text-workouter-black-700">Iterations</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={block.iterations}
                        onChange={(e) => updateBlock({ iterations: parseInt(e.target.value) || 1 })}
                        className="input input-bordered w-24 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                    />
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg text-workouter-black-800">Steps</h4>
                        <button
                            type="button"
                            onClick={addStepToBlock}
                            className="btn btn-sm bg-workouter-orange-500 hover:bg-workouter-orange-600 text-white border-0 transition-colors duration-200"
                        >
                            Add Step
                        </button>
                    </div>

                    {block.steps.map((step) => (
                        <div key={step.id} className="ml-4">
                            <StepCard
                                step={step}
                                onUpdate={(updatedStep) => updateStep(step.id, updatedStep)}
                                onRemove={() => removeStep(step.id)}
                                canRemove={block.steps.length > 1}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

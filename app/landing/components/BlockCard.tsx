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
        <div className="card bg-base-100 shadow-xl border-2 border-primary/20">
            <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="card-title text-xl text-primary">
                        Block {block.type === 'work' ? 'Work' : 'Recovery'}
                    </h3>
                    {canRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
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
                                className="radio radio-primary"
                            />
                            <span className="label-text">Work</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={block.type === 'recovery'}
                                onChange={() => updateBlock({ type: 'recovery' })}
                                className="radio radio-primary"
                            />
                            <span className="label-text">Recovery</span>
                        </label>
                    </div>
                </div>

                {/* Iterations input */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-medium">Iterations</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={block.iterations}
                        onChange={(e) => updateBlock({ iterations: parseInt(e.target.value) || 1 })}
                        className="input input-bordered w-24"
                    />
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Steps</h4>
                        <button
                            type="button"
                            onClick={addStepToBlock}
                            className="btn btn-primary btn-sm"
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

import { BlockCard } from "./BlockCard";
import { Block } from "./types";
import { createDefaultBlock } from "./utils";

interface CustomWorkoutBuilderProps {
    blocks: Block[];
    onUpdate: (blocks: Block[]) => void;
}

export const CustomWorkoutBuilder = ({
    blocks,
    onUpdate
}: CustomWorkoutBuilderProps): JSX.Element => {
    const addBlock = () => {
        onUpdate([...blocks, createDefaultBlock()]);
    };

    const updateBlock = (blockId: string, updates: Partial<Block>) => {
        const updatedBlocks = blocks.map(block =>
            block.id === blockId ? { ...block, ...updates } : block
        );
        onUpdate(updatedBlocks);
    };

    const removeBlock = (blockId: string) => {
        if (blocks.length > 1) {
            const updatedBlocks = blocks.filter(block => block.id !== blockId);
            onUpdate(updatedBlocks);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-workouter-orange-600 mb-4">Custom Workout Builder</h2>
                <p className="text-workouter-black-600">
                    Create your workout by adding blocks and steps. Each block can be repeated multiple times.
                </p>
            </div>

            <div className="space-y-6">
                {blocks.map((block) => (
                    <div key={block.id}>
                        <BlockCard
                            block={block}
                            onUpdate={(updatedBlock) => updateBlock(block.id, updatedBlock)}
                            onRemove={() => removeBlock(block.id)}
                            canRemove={blocks.length > 1}
                        />
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <button
                    type="button"
                    onClick={addBlock}
                    className="btn btn-lg btn-brand hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    Add New Block
                </button>
            </div>
        </div>
    );
};

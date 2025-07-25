import React from 'react';

interface ProjectionControlsProps {
    onChange: (newSettings: { projection: string }) => void;
}

const ProjectionControls: React.FC<ProjectionControlsProps> = ({ onChange }) => {
    const [projection, setProjection] = React.useState<string>('Mercator');

    const handleProjectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setProjection(event.target.value);
        onChange({ projection: event.target.value }); // Notify parent of the change
    };

    return (
        <div className="projection-controls">
            <label htmlFor="projection-select">Select Map Projection:</label>
            <select id="projection-select" value={projection} onChange={handleProjectionChange}>
                <option value="Mercator">Mercator</option>
                <option value="Robinson">Robinson</option>
                <option value="Orthographic">Orthographic</option>
                <option value="Equirectangular">Equirectangular</option>
                {/* Add more projections as needed */}
            </select>
        </div>
    );
};

export default ProjectionControls;
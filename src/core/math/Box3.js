(function() {
    var Box3 = function(min, max) {
        this.min = (min !== undefined) ? min : new zen3d.Vector3(+Infinity, +Infinity, +Infinity);
        this.max = (max !== undefined) ? max : new zen3d.Vector3(-Infinity, -Infinity, -Infinity);
    }

    Box3.prototype.set = function(min, max) {
        this.min.copy(min);
        this.max.copy(max);
    }

    Box3.prototype.setFromPoints = function(points) {
        this.makeEmpty();

        for (var i = 0, il = points.length; i < il; i++) {
            this.expandByPoint(points[i]);
        }

        return this;
    }

    Box3.prototype.makeEmpty = function() {
        this.min.x = this.min.y = this.min.z = +Infinity;
        this.max.x = this.max.y = this.max.z = -Infinity;

        return this;
    }

    Box3.prototype.expandByPoint = function(point) {
        this.min.min(point);
        this.max.max(point);

        return this;
    }

    Box3.prototype.expandByScalar = function(scalar) {
        this.min.addScalar(-scalar);
        this.max.addScalar(scalar);

        return this;
    }

    Box3.prototype.setFromArray = function(array, gap) {
        var minX = +Infinity;
        var minY = +Infinity;
        var minZ = +Infinity;

        var maxX = -Infinity;
        var maxY = -Infinity;
        var maxZ = -Infinity;

        var _gap = (gap !== undefined ? gap : 3);

        for (var i = 0, l = array.length; i < l; i += _gap) {

            var x = array[i];
            var y = array[i + 1];
            var z = array[i + 2];

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;

            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;

        }

        this.min.set(minX, minY, minZ);
        this.max.set(maxX, maxY, maxZ);

        return this;
    }

    Box3.prototype.isEmpty = function() {
        // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
        return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
    }

    Box3.prototype.equals = function(box) {
        return box.min.equals(this.min) && box.max.equals(this.max);
    }

    Box3.prototype.getCenter = function(optionalTarget) {
        var result = optionalTarget || new zen3d.Vector3();
        return this.isEmpty() ? result.set(0, 0, 0) : result.addVectors(this.min, this.max).multiplyScalar(0.5);
    }

    Box3.prototype.applyMatrix4 = function() {
        var points = [
            new zen3d.Vector3(),
            new zen3d.Vector3(),
            new zen3d.Vector3(),
            new zen3d.Vector3(),
            new zen3d.Vector3(),
            new zen3d.Vector3(),
            new zen3d.Vector3(),
            new zen3d.Vector3()
        ];

        return function applyMatrix4(matrix) {
            // transform of empty box is an empty box.
            if (this.isEmpty()) return this;

            // NOTE: I am using a binary pattern to specify all 2^3 combinations below
            points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000
            points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001
            points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010
            points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011
            points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100
            points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101
            points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110
            points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix); // 111

            this.setFromPoints(points);

            return this;
        };
    }()

    Box3.prototype.copy = function(box) {
        this.min.copy(box.min);
        this.max.copy(box.max);

        return this;
    }

    zen3d.Box3 = Box3;
})();
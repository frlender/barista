describe('CellCountModel',function(){
	describe('should have default',function(){
		it('pert_count equal to 0',function(){
			var o = new CellCountModel();
			expect(o.get("pert_count")).toEqual(0);
		});
		it('pert_types equal to [{}]',function(){
			var o = new CellCountModel();
			expect(o.get("pert_types")).toEqual([{}]);
		});
		it('last_update equal to (new Date()).getTime()',function(){
			var o = new CellCountModel();
			var diff = (new Date()).getTime() - o.get("last_update")
			expect(diff).toBeLessThan(100);
		});
	});
})